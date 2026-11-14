import {useEffect, useState, type ReactNode} from 'react';

/** Portrait (4:5) photos in public/photos/. Missing files are skipped automatically. */
export const HERO_PHOTOS = ['/photos/hero-1.jpg', '/photos/hero-2.jpg', '/photos/hero-3.jpg', '/photos/hero-4.jpg'];
const SLIDE_MS = 6500;

function PhotoSlider() {
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const photos = HERO_PHOTOS.filter((p) => !failed.has(p));
  const [index, setIndex] = useState(0);
  const count = photos.length;

  useEffect(() => {
    if (count < 2) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [count]);

  const current = count ? index % count : 0;

  return (
    <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[22px] bg-fg/5 ring-1 ring-fg/10 md:aspect-[4/5]">
      {HERO_PHOTOS.map((src) =>
        failed.has(src) ? null : (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden="true"
            onError={() => setFailed((f) => new Set(f).add(src))}
            className={`kenburns absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-out ${
              photos[current] === src ? 'is-active opacity-100' : 'opacity-0'
            }`}
            style={{filter: 'var(--photo-filter)'}}
          />
        ),
      )}
      {/* readability gradient + grain */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="grain" />
      </div>
      <div aria-hidden="true" className="hud-frame !inset-3" />

      {count > 1 && (
        <div className="absolute inset-x-5 bottom-5 flex items-center gap-3" dir="ltr">
          <span className="font-display text-sm font-semibold tracking-[0.12em] text-[#f5f2ed]">
            {String(current + 1).padStart(2, '0')}
            <span className="text-[#f5f2ed]/50"> / {String(count).padStart(2, '0')}</span>
          </span>
          <div className="flex flex-1 gap-1.5">
            {photos.map((src, i) => (
              <button
                key={src}
                onClick={() => setIndex(i)}
                aria-label={`${i + 1} / ${count}`}
                className="ring-focus h-4 flex-1 cursor-pointer py-1.5"
              >
                <span className={`block h-full rounded-full transition-colors ${i === current ? 'bg-accent' : 'bg-[#f5f2ed]/35'}`} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Poster-style home scene: a huge halftone wordmark behind a two-column
 * layout — headline on one side, a slow cinematic photo slider on the other.
 */
export function HeroScene({children}: {children: ReactNode}) {
  return (
    <section className="relative isolate overflow-hidden rounded-[28px] border border-fg/10 bg-panel">
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{background: 'var(--hero-glow)'}} />
      <div aria-hidden="true" className="band -z-10 top-[38%] opacity-60" />
      <p
        aria-hidden="true"
        dir="ltr"
        className="halftone text-gradient font-display pointer-events-none absolute inset-x-0 top-[5%] -z-10 hidden select-none md:block text-center text-[clamp(84px,19vw,260px)] font-bold uppercase leading-[0.85]"
      >
        Saiyakat
      </p>
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        <div className="grain" />
      </div>
      <div aria-hidden="true" className="hud-frame" />

      <div className="grid gap-5 p-4 pt-4 sm:p-7 md:grid-cols-[1.1fr_0.9fr] md:items-end md:pt-16">
        <div className="order-2 md:order-1">{children}</div>
        <div className="order-1 md:order-2">
          <PhotoSlider />
        </div>
      </div>
    </section>
  );
}
