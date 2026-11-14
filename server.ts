import 'dotenv/config';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import express, {type Request, type Response} from 'express';
import Anthropic from '@anthropic-ai/sdk';
import {db, getSettings, requireUser, supabaseUrl, type AuthedRequest} from './server/auth';
import {adminRouter} from './server/admin';
import {createRateLimiter, sameOriginOnly, securityHeaders} from './server/security';

const here = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

// Stable system prompt (cached). The locale hint goes in a second block so the
// big block stays byte-identical across requests.
const SYSTEM_PROMPT = `You are Saiyakat, a friendly and expert AI travel agent that helps people plan trips anywhere in the world.

Language:
- Always reply in the language of the user's most recent message, whatever it is. If they switch languages, switch with them.
- If the message has no clear language (e.g. only a place name or emoji), use the interface language given below.

How to help:
- Before proposing a full route, make sure you know the essentials: destination (or the kind of place they want), dates or trip length, rough budget, who is travelling, and interests or pace. Ask for what is missing in one short, friendly message (max 3 questions). If the user wants ideas fast, give a draft and ask to refine.
- When you propose a route, structure it day by day with headings ("Day 1 — ..."), and for each day: places to see, how to get between them, where to eat, and an approximate cost range. Finish with practical tips: visas/entry rules to double-check, local transport, money, safety, best season, and a few useful local phrases with pronunciation.
- Prices, opening hours, visa rules and schedules change: give realistic ranges and tell the user to verify anything critical before booking. Never invent specific bookings, phone numbers or exact prices.
- Be concise and warm. Use Markdown: short headings, bullet lists, bold for key names. No tables wider than 4 columns.
- You only help with travel and trip planning. Politely steer other topics back to travel.

Route map (machine-readable, hidden from the user):
- Whenever your reply contains a concrete itinerary or a list of places to visit, end the reply with exactly one fenced block tagged saiyakat-route, after all other text, containing only JSON in this shape:
\`\`\`saiyakat-route
{"title":"<short trip title in the user's language>","stops":[{"day":1,"name":"<place name in the user's language>","lat":41.0086,"lng":28.9802}]}
\`\`\`
- List the main stops in visiting order (at most 25), with your best-known latitude/longitude in decimal degrees. Use real, specific places only; omit any place whose location you are not confident about. "day" is the day number of the itinerary (use 1 if there are no days).
- Do not mention this block, and do not add it when you are only asking clarifying questions.`;

const LANG_NAMES: Record<string, string> = {
  ru: 'Russian', en: 'English', ky: 'Kyrgyz', kk: 'Kazakh', uz: 'Uzbek',
  tr: 'Turkish', zh: 'Chinese (Simplified)', de: 'German', ar: 'Arabic',
};

const MAX_MESSAGES = 40;
const MAX_CHARS = 8000;

// Burst protection on top of the per-user daily limit.
const ipLimited = createRateLimiter(30, 5 * 60_000);
const userLimited = createRateLimiter(15, 5 * 60_000);

type ChatBody = {messages?: unknown; locale?: unknown};

function parseMessages(raw: unknown): Anthropic.Beta.BetaMessageParam[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: Anthropic.Beta.BetaMessageParam[] = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== 'object') return null;
    const {role, content} = m as {role?: unknown; content?: unknown};
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const text = content.trim().slice(0, MAX_CHARS);
    if (!text) continue;
    out.push({role, content: text});
  }
  // The conversation must start with a user turn and end with one.
  while (out.length && out[0].role !== 'user') out.shift();
  if (!out.length || out[out.length - 1].role !== 'user') return null;
  return out;
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Cloud Run: exactly one proxy hop; don't trust client-supplied X-Forwarded-For
app.use(securityHeaders(isProd, supabaseUrl));
app.use('/api', express.json({limit: '200kb'}), sameOriginOnly);

app.get('/api/health', (_req, res) => {
  res.json({ok: true, ai: Boolean(anthropic), auth: Boolean(db)});
});

app.get('/api/me', requireUser, (req, res) => {
  res.json({admin: (req as AuthedRequest).isAdmin});
});

app.use('/api/admin', adminRouter);

app.post('/api/chat', requireUser, async (req: Request, res: Response) => {
  const {user, isAdmin} = req as AuthedRequest;
  if (!anthropic) {
    res.status(503).json({error: 'ai_not_configured'});
    return;
  }
  if (ipLimited(req.ip ?? 'unknown') || userLimited(user.id)) {
    res.status(429).json({error: 'rate_limited'});
    return;
  }

  let usageId: number | null = null;
  try {
    const [settings, profile] = await Promise.all([
      getSettings(),
      db!.from('profiles').select('banned').eq('id', user.id).maybeSingle(),
    ]);
    if (profile.error) throw profile.error;
    if (profile.data?.banned) {
      res.status(403).json({error: 'banned'});
      return;
    }
    if (!settings.ai_enabled && !isAdmin) {
      res.status(503).json({error: 'ai_disabled'});
      return;
    }
    if (!isAdmin) {
      const since = new Date(Date.now() - 864e5).toISOString();
      const {count, error} = await db!
        .from('usage_events')
        .select('*', {count: 'exact', head: true})
        .eq('user_id', user.id)
        .gte('created_at', since);
      if (error) throw error;
      if ((count ?? 0) >= settings.daily_limit) {
        res.status(429).json({error: 'daily_limit'});
        return;
      }
    }
    // Record the request up front so aborted streams still count toward the limit.
    const ins = await db!.from('usage_events').insert({user_id: user.id}).select('id').single();
    if (ins.error) throw ins.error;
    usageId = ins.data.id;
  } catch (err) {
    console.error('[chat:precheck]', err);
    res.status(503).json({error: 'server_error'});
    return;
  }
  const body = req.body as ChatBody;
  const messages = parseMessages(body.messages);
  if (!messages) {
    res.status(400).json({error: 'bad_request'});
    return;
  }
  const locale = typeof body.locale === 'string' && LANG_NAMES[body.locale] ? body.locale : 'en';

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const stream = anthropic.beta.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: {effort: 'medium'},
    system: [
      {type: 'text', text: SYSTEM_PROMPT, cache_control: {type: 'ephemeral'}},
      {type: 'text', text: `Interface language: ${LANG_NAMES[locale]}.`},
    ],
    messages,
  });

  let closed = false;
  res.on('close', () => {
    if (!res.writableFinished) {
      closed = true;
      stream.abort();
    }
  });

  try {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        send('delta', {text: event.delta.text});
      }
    }
    const final = await stream.finalMessage();
    if (usageId !== null) {
      const u = final.usage;
      db!
        .from('usage_events')
        .update({
          input_tokens: u.input_tokens + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0),
          output_tokens: u.output_tokens,
        })
        .eq('id', usageId)
        .then(({error}) => error && console.error('[usage]', error));
    }
    if (final.stop_reason === 'refusal') send('error', {error: 'refusal'});
    send('done', {stop: final.stop_reason});
  } catch (err) {
    if (closed) return;
    let code = 'server_error';
    if (err instanceof Anthropic.RateLimitError) code = 'rate_limited';
    else if (err instanceof Anthropic.AuthenticationError) code = 'ai_not_configured';
    else if (err instanceof Anthropic.APIConnectionError) code = 'upstream_unavailable';
    else if (err instanceof Anthropic.APIError && (err.status ?? 0) >= 500) code = 'upstream_unavailable';
    console.error('[chat]', err);
    send('error', {error: code});
  } finally {
    if (!closed) res.end();
  }
});

app.use('/api', (_req, res) => {
  res.status(404).json({error: 'not_found'});
});

async function start() {
  if (isProd) {
    const dist = path.resolve(here, '../dist');
    app.use(express.static(dist, {index: false, maxAge: '1h'}));
    app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  } else {
    const {createServer} = await import('vite');
    const vite = await createServer({server: {middlewareMode: true}, appType: 'spa'});
    app.use(vite.middlewares);
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Saiyakat on http://localhost:${PORT} (AI: ${anthropic ? MODEL : 'not configured'})`);
  });
}

start();
