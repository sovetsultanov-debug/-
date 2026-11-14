import 'dotenv/config';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import express, {type Request, type Response} from 'express';
import Anthropic from '@anthropic-ai/sdk';

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
- You only help with travel and trip planning. Politely steer other topics back to travel.`;

const LANG_NAMES: Record<string, string> = {
  ru: 'Russian', en: 'English', ky: 'Kyrgyz', kk: 'Kazakh', uz: 'Uzbek',
  tr: 'Turkish', zh: 'Chinese (Simplified)', de: 'German', ar: 'Arabic',
};

const MAX_MESSAGES = 40;
const MAX_CHARS = 8000;

// Very small in-memory rate limiter: 20 requests / 5 min per IP.
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 5 * 60_000;
  const list = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  return list.length > 20;
}

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
app.set('trust proxy', true);
app.use(express.json({limit: '200kb'}));

app.get('/api/health', (_req, res) => {
  res.json({ok: true, ai: Boolean(anthropic)});
});

app.post('/api/chat', async (req: Request, res: Response) => {
  if (!anthropic) {
    res.status(503).json({error: 'ai_not_configured'});
    return;
  }
  if (rateLimited(req.ip ?? 'unknown')) {
    res.status(429).json({error: 'rate_limited'});
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
