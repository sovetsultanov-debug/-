import {Router, type Request, type Response} from 'express';
import {db, invalidateSettings, getSettings, isAdmin, requireAdmin, requireUser, type AuthedRequest} from './auth';
import {UUID_RE} from './security';

export const adminRouter = Router();
adminRouter.use(requireUser, requireAdmin);

function fail(res: Response, err: unknown) {
  console.error('[admin]', err);
  res.status(500).json({error: 'server_error'});
}

async function count(table: string, apply?: (q: any) => any): Promise<number> {
  let q = db!.from(table).select('*', {count: 'exact', head: true});
  if (apply) q = apply(q);
  const {count: c, error} = await q;
  if (error) throw error;
  return c ?? 0;
}

async function tokensSince(sinceIso: string): Promise<number> {
  // Sum tokens client-side over a bounded window.
  const {data, error} = await db!
    .from('usage_events')
    .select('input_tokens, output_tokens')
    .gte('created_at', sinceIso)
    .limit(50_000);
  if (error) throw error;
  return (data ?? []).reduce((s, r) => s + r.input_tokens + r.output_tokens, 0);
}

adminRouter.get('/stats', async (_req, res) => {
  try {
    const day = new Date(Date.now() - 864e5).toISOString();
    const week = new Date(Date.now() - 7 * 864e5).toISOString();
    const [users, banned, newUsersWeek, chats, messages, reqDay, reqWeek, reqTotal, tokDay, tokWeek] =
      await Promise.all([
        count('profiles'),
        count('profiles', (q) => q.eq('banned', true)),
        count('profiles', (q) => q.gte('created_at', week)),
        count('chats'),
        count('messages'),
        count('usage_events', (q) => q.gte('created_at', day)),
        count('usage_events', (q) => q.gte('created_at', week)),
        count('usage_events'),
        tokensSince(day),
        tokensSince(week),
      ]);
    res.json({
      users,
      banned,
      newUsersWeek,
      chats,
      messages,
      requests: {day: reqDay, week: reqWeek, total: reqTotal},
      tokens: {day: tokDay, week: tokWeek},
    });
  } catch (err) {
    fail(res, err);
  }
});

adminRouter.get('/users', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    let query = db!.from('admin_user_stats').select('*').order('created_at', {ascending: false}).limit(500);
    if (q) query = query.ilike('email', `%${q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`);
    const {data, error} = await query;
    if (error) throw error;
    res.json({users: data ?? []});
  } catch (err) {
    fail(res, err);
  }
});

adminRouter.post('/users/:id/ban', async (req: Request, res: Response) => {
  const id = req.params.id;
  const banned = (req.body as {banned?: unknown})?.banned;
  if (!UUID_RE.test(id) || typeof banned !== 'boolean') {
    res.status(400).json({error: 'bad_request'});
    return;
  }
  try {
    // Never let an admin lock out an admin account (including their own).
    const {data: target, error: getErr} = await db!.auth.admin.getUserById(id);
    if (getErr || !target.user) {
      res.status(404).json({error: 'not_found'});
      return;
    }
    if (isAdmin(target.user)) {
      res.status(400).json({error: 'cannot_ban_admin'});
      return;
    }
    const {error} = await db!.from('profiles').update({banned}).eq('id', id);
    if (error) throw error;
    console.log(`[admin] ${(req as AuthedRequest).user.id} set banned=${banned} for ${id}`);
    res.json({ok: true});
  } catch (err) {
    fail(res, err);
  }
});

adminRouter.get('/settings', async (_req, res) => {
  try {
    res.json(await getSettings());
  } catch (err) {
    fail(res, err);
  }
});

adminRouter.put('/settings', async (req, res) => {
  const {ai_enabled, daily_limit} = (req.body ?? {}) as {ai_enabled?: unknown; daily_limit?: unknown};
  if (
    typeof ai_enabled !== 'boolean' ||
    typeof daily_limit !== 'number' ||
    !Number.isInteger(daily_limit) ||
    daily_limit < 0 ||
    daily_limit > 10000
  ) {
    res.status(400).json({error: 'bad_request'});
    return;
  }
  try {
    const {error} = await db!
      .from('app_settings')
      .upsert({id: 1, ai_enabled, daily_limit, updated_at: new Date().toISOString()});
    if (error) throw error;
    invalidateSettings();
    res.json({ai_enabled, daily_limit});
  } catch (err) {
    fail(res, err);
  }
});

adminRouter.get('/users/:id/chats', async (req, res) => {
  if (!UUID_RE.test(req.params.id)) {
    res.status(400).json({error: 'bad_request'});
    return;
  }
  try {
    const {data, error} = await db!
      .from('chats')
      .select('id, title, created_at, updated_at')
      .eq('user_id', req.params.id)
      .order('updated_at', {ascending: false})
      .limit(200);
    if (error) throw error;
    res.json({chats: data ?? []});
  } catch (err) {
    fail(res, err);
  }
});

adminRouter.get('/chats/:id/messages', async (req, res) => {
  if (!UUID_RE.test(req.params.id)) {
    res.status(400).json({error: 'bad_request'});
    return;
  }
  try {
    const {data, error} = await db!
      .from('messages')
      .select('id, role, content, created_at')
      .eq('chat_id', req.params.id)
      .order('created_at', {ascending: true})
      .limit(1000);
    if (error) throw error;
    res.json({messages: data ?? []});
  } catch (err) {
    fail(res, err);
  }
});
