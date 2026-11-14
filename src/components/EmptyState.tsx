import {useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {useI18n} from '../i18n';
import {HeroScene} from './HeroScene';

/** One portrait photo per suggestion card, in the same order as t.chips. */
const TRIP_PHOTOS = ['/photos/trip-1.jpg', '/photos/trip-2.jpg', '/photos/trip-3.jpg', '/photos/trip-4.jpg'];

function TripCard({title, prompt, photo, delay, onPick}: {title: string; prompt: string; photo?: string; delay: number; onPick: () => void}) {
  const [ok, setOk] = useState(true);
  return (
    <button
      onClick={onPick}
      style={{animationDelay: `${delay}ms`}}
      className="ring-focus rise group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[20px] bg-panel p-4 text-start ring-1 ring-fg/10 transition-transform duration-300 hover:-translate-y-1"
    >
      {photo && ok && (
        <img
          src={photo}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={() => setOk(false)}
          className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{filter: 'var(--photo-filter)'}}
        />
      )}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/40 to-black/5" />
      <span className="absolute end-3 top-3 grid size-9 place-items-center rounded-full bg-black/35 text-[#f5f2ed] ring-1 ring-[#f5f2ed]/20 backdrop-blur-md transition-colors group-hover:bg-accent">
        <ArrowUpRight className="size-4 rtl:-scale-x-100" />
      </span>
      <span className="mb-2 flex items-center gap-2">
        <span aria-hidden="true" className="h-px w-5 bg-accent" />
        <span aria-hidden="true" className="size-1.5 rotate-45 bg-accent" />
      </span>
      <span className="font-display block text-[clamp(17px,2vw,21px)] font-semibold uppercase leading-tight tracking-[0.02em] text-[#f5f2ed]">
        {title}
      </span>
      <span className="mt-1.5 line-clamp-2 text-[12.5px] leading-snug text-[#f5f2ed]/70">{prompt}</span>
    </button>
  );
}

export function EmptyState({onPick}: {onPick: (prompt: string) => void}) {
  const {t} = useI18n();
  const stats: [string, string][] = [
    ['195+', t.statCountries],
    ['9', t.statLanguages],
    ['24/7', t.statAgent],
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 pb-6 pt-2">
      <HeroScene>
        <div className="rise flex flex-col gap-4">
          <span className="hud-label">{t.tagline}</span>
          <h1 className="font-display text-[clamp(38px,6.4vw,76px)] font-bold uppercase leading-[0.92] text-fg">{t.heroTitle}</h1>
          <p className="max-w-md text-[clamp(14.5px,1.8vw,16.5px)] leading-relaxed text-fg/70">{t.heroSubtitle}</p>

          <dl className="mt-1 flex w-fit items-stretch overflow-hidden rounded-2xl bg-[#0b0b0b] text-[#f5f2ed] ring-1 ring-[#f5f2ed]/10">
            {stats.map(([value, label], i) => (
              <div key={label} className={`px-4 py-2.5 sm:px-5 ${i ? 'border-s border-[#f5f2ed]/15' : ''}`}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-xl font-semibold leading-none sm:text-2xl" dir="ltr">
                  {value}
                </dd>
                <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#f5f2ed]/60">{label}</p>
              </div>
            ))}
          </dl>
          <span className="hud-label hidden md:block" dir="ltr">
            42.87° N · 74.59° E
          </span>
        </div>
      </HeroScene>

      <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
        {t.chips.map((c, i) => (
          <TripCard key={c.title} title={c.title} prompt={c.prompt} photo={TRIP_PHOTOS[i]} delay={120 + i * 60} onPick={() => onPick(c.prompt)} />
        ))}
      </div>
    </div>
  );
}
