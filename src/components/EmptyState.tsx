import {ArrowUpRight} from 'lucide-react';
import {useI18n} from '../i18n';
import {HeroScene} from './HeroScene';

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
        {/* HUD row */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-7">
          <span className="hud-label">{t.tagline}</span>
          <span className="hud-label hidden text-end sm:block" dir="ltr">
            42.87° N · 74.59° E
          </span>
        </div>

        {/* Title card */}
        <div className="rise relative z-10 m-4 flex max-w-xl flex-col gap-4 sm:m-7">
          <div className="glass rounded-[22px] p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-px w-8 bg-accent" />
              <span className="size-1.5 rotate-45 bg-accent" />
            </div>
            <h1 className="font-display text-[clamp(30px,5.2vw,54px)] font-bold uppercase leading-[0.98] tracking-[0.005em] text-fg">
              {t.heroTitle}
            </h1>
            <p className="mt-3 max-w-md text-[clamp(14.5px,1.8vw,16px)] leading-relaxed text-fg/70">{t.heroSubtitle}</p>
          </div>

          <dl className="flex w-fit items-stretch overflow-hidden rounded-2xl bg-[#0b0b0b] text-[#f5f2ed] ring-1 ring-[#f5f2ed]/10">
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
        </div>
      </HeroScene>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {t.chips.map((c, i) => (
          <button
            key={c.title}
            onClick={() => onPick(c.prompt)}
            style={{animationDelay: `${120 + i * 60}ms`}}
            className="glass glass-hover ring-focus rise group relative flex items-start gap-4 overflow-hidden rounded-[20px] p-4 text-start hover:-translate-y-0.5"
          >
            <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rotate-45 bg-accent" />
            <span className="min-w-0 flex-1">
              <span className="font-display block text-[17px] font-semibold uppercase tracking-[0.02em] text-fg">{c.title}</span>
              <span className="mt-1 line-clamp-1 block text-[13px] leading-snug text-fg/55 sm:line-clamp-2">{c.prompt}</span>
            </span>
            <ArrowUpRight className="size-5 shrink-0 text-fg/40 transition-colors group-hover:text-accent rtl:-scale-x-100" />
          </button>
        ))}
      </div>
    </div>
  );
}
