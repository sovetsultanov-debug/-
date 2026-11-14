import type {NextFunction, Request, Response} from 'express';
import {createClient, type SupabaseClient, type User} from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Service-role client. Bypasses RLS — never expose it or its key to the browser. */
export const db: SupabaseClient | null =
  url && serviceKey
    ? createClient(url, serviceKey, {auth: {persistSession: false, autoRefreshToken: false}})
    : null;

export const supabaseUrl = url;

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export type AuthedRequest = Request & {user: User; isAdmin: boolean};

/** Admin = confirmed email listed in ADMIN_EMAILS. Unconfirmed emails never count. */
export function isAdmin(user: User): boolean {
  const email = user.email?.toLowerCase();
  return Boolean(email && user.email_confirmed_at && ADMIN_EMAILS.has(email));
}

async function userFromRequest(req: Request): Promise<User | null> {
  if (!db) return null;
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  if (!token || token.length > 4096) return null;
  const {data, error} = await db.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  if (!db) {
    res.status(503).json({error: 'auth_not_configured'});
    return;
  }
  try {
    const user = await userFromRequest(req);
    if (!user) {
      res.status(401).json({error: 'auth_required'});
      return;
    }
    (req as AuthedRequest).user = user;
    (req as AuthedRequest).isAdmin = isAdmin(user);
    next();
  } catch (err) {
    console.error('[auth]', err);
    res.status(503).json({error: 'auth_unavailable'});
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!(req as AuthedRequest).isAdmin) {
    res.status(403).json({error: 'forbidden'});
    return;
  }
  next();
}

// ---- App settings (cached briefly so every chat request doesn't hit the DB) ----
export type AppSettings = {ai_enabled: boolean; daily_limit: number};
const DEFAULT_SETTINGS: AppSettings = {ai_enabled: true, daily_limit: 30};
let cache: {value: AppSettings; at: number} | null = null;

export async function getSettings(): Promise<AppSettings> {
  if (cache && Date.now() - cache.at < 15_000) return cache.value;
  if (!db) return DEFAULT_SETTINGS;
  const {data, error} = await db.from('app_settings').select('ai_enabled, daily_limit').eq('id', 1).maybeSingle();
  if (error) throw error;
  const value = (data as AppSettings | null) ?? DEFAULT_SETTINGS;
  cache = {value, at: Date.now()};
  return value;
}

export function invalidateSettings() {
  cache = null;
}
