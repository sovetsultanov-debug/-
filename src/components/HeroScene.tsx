import {useState, type ReactNode} from 'react';

/** Drop a photo at public/hero/hero.jpg and it replaces the drawn mountains automatically. */
const HERO_PHOTO = '/hero/hero.jpg';

/**
 * Poster-style home scene: crimson sun, a huge halftone wordmark behind the
 * ridges (or over the user's photo), HUD hairlines and film grain.
 */
export function HeroScene({children}: {children: ReactNode}) {
  const [photo, setPhoto] = useState<'loading' | 'ok' | 'none'>('loading');

  return (
    <section className="relative isolate flex min-h-[clamp(440px,64vh,620px)] flex-col justify-end overflow-hidden rounded-[28px] border border-fg/10 bg-panel">
      {/* crimson glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{background: 'var(--hero-glow)'}}
      />

      {/* user's photo, if present */}
      <img
        src={HERO_PHOTO}
        alt=""
        aria-hidden="true"
        onLoad={() => setPhoto('ok')}
        onError={() => setPhoto('none')}
        className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-700 ${photo === 'ok' ? 'opacity-100' : 'opacity-0'}`}
        style={{filter: 'var(--photo-filter)', mixBlendMode: 'var(--photo-blend)' as never}}
      />

      <div aria-hidden="true" className="band -z-10 top-[30%] opacity-70" />

      {/* sun */}
      <div aria-hidden="true" className="sun-in absolute end-[8%] top-[9%] -z-10 aspect-square w-[clamp(150px,24vw,300px)]">
        <div className="absolute -inset-[7%] rounded-full border border-gold/60" />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--c-accent) 85%, white), var(--c-accent) 45%, var(--c-crimson))',
            boxShadow: '0 0 120px 20px var(--c-accent-glow)',
          }}
        />
      </div>

      {/* giant halftone wordmark */}
      <p
        aria-hidden="true"
        dir="ltr"
        className="halftone text-gradient font-display pointer-events-none absolute inset-x-0 top-[14%] -z-10 select-none text-center text-[clamp(84px,19vw,260px)] font-bold uppercase leading-[0.85] tracking-[-0.01em]"
      >
        Saiyakat
      </p>

      {/* drawn ridges when there is no photo */}
      {photo !== 'ok' && (
        <svg aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-[62%] w-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
          <path d="M0 210 L120 150 L210 190 L330 80 L430 170 L520 120 L640 200 L760 100 L880 180 L990 110 L1100 170 L1200 130 L1200 400 L0 400 Z" fill="var(--ridge-far)" />
          <path d="M0 270 L150 210 L260 250 L390 180 L520 245 L650 205 L790 265 L910 215 L1040 255 L1200 200 L1200 400 L0 400 Z" fill="var(--ridge-mid)" />
          <path d="M0 330 L180 290 L330 320 L470 280 L640 330 L800 295 L960 330 L1110 300 L1200 315 L1200 400 L0 400 Z" fill="var(--c-panel)" />
          {/* a walker on the ridge, for scale */}
          <g className="max-sm:hidden" transform="translate(905 286)" fill="var(--c-fg)" opacity="0.85">
            <circle cx="0" cy="-23" r="3.2" />
            <path d="M-3 -19 L3 -19 L4 -6 L2 6 L0 6 L0 -4 L-1 6 L-3 6 L-4 -6 Z" />
            <rect x="-7.5" y="-18" width="5" height="9" rx="1.5" />
            <path d="M5 -16 L9 6" stroke="var(--c-fg)" strokeWidth="1" />
          </g>
          {/* birds */}
          <g className="max-sm:hidden" fill="none" stroke="var(--c-fg)" strokeWidth="1.6" opacity="0.6">
            <path d="M760 70 q6 -6 12 0 q6 -6 12 0" />
            <path d="M800 52 q5 -5 10 0 q5 -5 10 0" />
            <path d="M735 48 q4 -4 8 0 q4 -4 8 0" />
          </g>
        </svg>
      )}

      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        <div className="grain" />
      </div>
      <div aria-hidden="true" className="hud-frame" />

      {children}
    </section>
  );
}
