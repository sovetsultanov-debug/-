import type {NextFunction, Request, Response} from 'express';

/** Security headers. CSP is only applied in production (Vite dev needs inline scripts). */
export function securityHeaders(isProd: boolean, supabaseUrl: string | undefined) {
  const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : '';
  const supabaseWs = supabaseOrigin.replace(/^http/, 'ws');
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://*.basemaps.cartocdn.com",
    "font-src 'self' data:",
    `connect-src 'self' ${supabaseOrigin} ${supabaseWs}`.trim(),
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');

  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    if (isProd) {
      res.setHeader('Content-Security-Policy', csp);
      res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
    }
    next();
  };
}

/** Sliding-window in-memory rate limiter. */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  setInterval(() => {
    const now = Date.now();
    for (const [key, list] of hits) {
      const fresh = list.filter((t) => now - t < windowMs);
      if (fresh.length) hits.set(key, fresh);
      else hits.delete(key);
    }
  }, windowMs).unref();

  return (key: string): boolean => {
    const now = Date.now();
    const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    list.push(now);
    hits.set(key, list);
    return list.length > limit;
  };
}

/** Reject cross-site requests to the API (defence in depth on top of bearer auth). */
export function sameOriginOnly(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  const origin = req.headers.origin;
  if (origin) {
    const host = req.headers['x-forwarded-host'] ?? req.headers.host;
    try {
      if (new URL(origin).host !== host) {
        res.status(403).json({error: 'forbidden'});
        return;
      }
    } catch {
      res.status(403).json({error: 'forbidden'});
      return;
    }
  }
  next();
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
