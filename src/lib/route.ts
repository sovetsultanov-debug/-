export type RouteStop = {day: number; name: string; lat: number; lng: number};
export type Route = {title: string; stops: RouteStop[]};

const FENCE = '```saiyakat-route';
const MAX_STOPS = 40;

/**
 * The AI appends a fenced `saiyakat-route` JSON block to answers that contain
 * an itinerary. Split it off: `text` is what we render, `route` feeds the map.
 * While streaming, an unfinished block is hidden too.
 */
export function splitRoute(content: string): {text: string; route: Route | null} {
  const start = content.lastIndexOf(FENCE);
  if (start === -1) return {text: content, route: null};
  const text = content.slice(0, start).trimEnd();
  const bodyStart = start + FENCE.length;
  const end = content.indexOf('```', bodyStart);
  if (end === -1) return {text, route: null};
  return {text, route: parseRoute(content.slice(bodyStart, end))};
}

function parseRoute(raw: string): Route | null {
  try {
    const data = JSON.parse(raw) as {title?: unknown; stops?: unknown};
    if (!Array.isArray(data.stops)) return null;
    const stops: RouteStop[] = [];
    for (const s of data.stops.slice(0, MAX_STOPS)) {
      if (!s || typeof s !== 'object') continue;
      const {day, name, lat, lng} = s as Record<string, unknown>;
      const la = Number(lat);
      const ln = Number(lng);
      if (typeof name !== 'string' || !name.trim()) continue;
      if (!Number.isFinite(la) || !Number.isFinite(ln) || Math.abs(la) > 90 || Math.abs(ln) > 180) continue;
      const d = Number(day);
      stops.push({day: Number.isInteger(d) && d > 0 && d < 100 ? d : 1, name: name.trim().slice(0, 120), lat: la, lng: ln});
    }
    if (stops.length === 0) return null;
    const title = typeof data.title === 'string' ? data.title.trim().slice(0, 120) : '';
    return {title, stops};
  } catch {
    return null;
  }
}
