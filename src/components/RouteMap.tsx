import {useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {Maximize2, X} from 'lucide-react';
import type {Route} from '../lib/route';
import {useI18n} from '../i18n';

const TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>';

// One hue per day so multi-day routes read at a glance.
const DAY_COLORS = ['#5eead4', '#818cf8', '#f0abfc', '#fcd34d', '#7dd3fc', '#fda4af', '#86efac'];
const dayColor = (day: number) => DAY_COLORS[(day - 1) % DAY_COLORS.length];

function MapView({route, interactive, focus}: {route: Route; interactive: boolean; focus: number | null}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, {
      zoomControl: interactive,
      scrollWheelZoom: interactive,
      dragging: true,
      attributionControl: true,
      worldCopyJump: true,
    });
    m.attributionControl.setPrefix(false);
    L.tileLayer(TILES, {attribution: ATTRIBUTION, subdomains: 'abcd', maxZoom: 19, detectRetina: true}).addTo(m);

    const latlngs = route.stops.map((s) => L.latLng(s.lat, s.lng));
    L.polyline(latlngs, {color: '#a5b4fc', weight: 3, opacity: 0.85, dashArray: '6 8'}).addTo(m);
    markers.current = route.stops.map((s, i) =>
      L.marker([s.lat, s.lng], {
        title: s.name,
        icon: L.divIcon({
          className: '',
          html: `<span class="route-pin" style="--pin:${dayColor(s.day)}">${i + 1}</span>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      })
        .bindTooltip(s.name, {direction: 'top', offset: [0, -14], className: 'route-tip'})
        .addTo(m),
    );

    const bounds = L.latLngBounds(latlngs);
    if (latlngs.length === 1) m.setView(latlngs[0], 12);
    else m.fitBounds(bounds, {padding: [28, 28], maxZoom: 14});
    map.current = m;

    // Containers inside animated layouts may change size after mount.
    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(el.current);
    return () => {
      ro.disconnect();
      m.remove();
      map.current = null;
    };
  }, [route, interactive]);

  useEffect(() => {
    if (focus === null || !map.current) return;
    const s = route.stops[focus];
    map.current.flyTo([s.lat, s.lng], Math.max(map.current.getZoom(), 13), {duration: 0.6});
    markers.current[focus]?.openTooltip();
  }, [focus, route]);

  return <div ref={el} dir="ltr" className="route-map h-full w-full" />;
}

function StopList({route, onPick}: {route: Route; onPick: (i: number) => void}) {
  const {t} = useI18n();
  const days = useMemo(() => {
    const groups = new Map<number, {i: number; name: string}[]>();
    route.stops.forEach((s, i) => {
      if (!groups.has(s.day)) groups.set(s.day, []);
      groups.get(s.day)!.push({i, name: s.name});
    });
    return [...groups.entries()];
  }, [route]);
  const multiDay = days.length > 1;

  return (
    <ol className="space-y-3">
      {days.map(([day, stops]) => (
        <li key={day}>
          {multiDay && (
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{color: dayColor(day)}}>
              {t.day} {day}
            </p>
          )}
          <ul className="flex flex-wrap gap-1.5">
            {stops.map(({i, name}) => (
              <li key={i}>
                <button
                  onClick={() => onPick(i)}
                  className="ring-focus flex items-center gap-1.5 rounded-full bg-white/6 py-1 pe-3 ps-1 text-[13px] text-white/80 ring-1 ring-white/10 transition-colors hover:bg-white/12 hover:text-white"
                >
                  <span
                    className="grid size-5 place-items-center rounded-full text-[11px] font-bold text-ink"
                    style={{background: dayColor(route.stops[i].day)}}
                  >
                    {i + 1}
                  </span>
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

export default function RouteMap({route}: {route: Route}) {
  const {t} = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [focus, setFocus] = useState<number | null>(null);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expanded]);

  return (
    <section className="glass rise mt-4 overflow-hidden rounded-[24px]" aria-label={t.routeMap}>
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/45">{t.routeMap}</p>
          {route.title && <p className="truncate text-[15px] font-semibold text-white">{route.title}</p>}
        </div>
        <button
          onClick={() => setExpanded(true)}
          className="ring-focus flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white/8 px-3 text-sm text-white/85 transition-colors hover:bg-white/14"
        >
          <Maximize2 className="size-3.5" />
          <span className="hidden sm:inline">{t.expandMap}</span>
        </button>
      </header>
      <div className="h-[260px] border-y border-white/8 sm:h-[300px]">
        {!expanded && <MapView route={route} interactive={false} focus={focus} />}
      </div>
      <div className="px-4 py-3.5">
        <StopList route={route} onPick={setFocus} />
      </div>

      {expanded &&
        createPortal(
        <div role="dialog" aria-modal="true" aria-label={route.title || t.routeMap} className="fixed inset-0 z-[70] flex flex-col bg-ink/80 p-2 backdrop-blur-md sm:p-5">
          <div className="glass-strong relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] lg:flex-row">
            <div className="relative min-h-0 flex-1">
              <MapView route={route} interactive focus={focus} />
              <button
                onClick={() => setExpanded(false)}
                aria-label={t.close}
                className="glass-strong ring-focus absolute end-3 top-3 z-[500] grid size-11 place-items-center rounded-full text-white"
              >
                <X className="size-5" />
              </button>
            </div>
            <aside className="scroll-thin max-h-[38vh] overflow-y-auto border-t border-white/8 p-4 lg:max-h-none lg:w-80 lg:border-s lg:border-t-0">
              {route.title && <p className="mb-3 text-lg font-semibold text-white">{route.title}</p>}
              <StopList route={route} onPick={setFocus} />
            </aside>
          </div>
        </div>,
          document.body,
        )}
    </section>
  );
}
