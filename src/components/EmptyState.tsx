import {Compass, Languages, Sparkles} from 'lucide-react';
import {useI18n} from '../i18n';
import {LogoMark} from './Logo';

const CHIP_EMOJI = ['🕌', '🌸', '🏔️', '🍝'];
const BADGE_ICONS = [Compass, Languages, Sparkles];

export function EmptyState({onPick}: {onPick: (prompt: string) => void}) {
  const {t} = useI18n();
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-1 pb-6 pt-[6vh] text-center sm:pt-[10vh]">
      <div className="rise">
        <LogoMark size={64} />
      </div>
      <h1 className="text-gradient rise mt-6 text-[clamp(2.1rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] [animation-delay:60ms]">
        {t.heroTitle}
      </h1>
      <p className="rise mt-4 max-w-lg text-[clamp(1rem,2.4vw,1.15rem)] leading-relaxed text-white/60 [animation-delay:120ms]">
        {t.heroSubtitle}
      </p>
      <div className="rise mt-6 flex flex-wrap justify-center gap-2 [animation-delay:180ms]">
        {t.badges.map((b, i) => {
          const Icon = BADGE_ICONS[i];
          return (
            <span key={b} className="glass flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-white/75">
              <Icon className="size-3.5 text-aqua" />
              {b}
            </span>
          );
        })}
      </div>
      <div className="mt-8 grid w-full sm:mt-10 grid-cols-1 gap-3 sm:grid-cols-2">
        {t.chips.map((c, i) => (
          <button
            key={c.title}
            onClick={() => onPick(c.prompt)}
            style={{animationDelay: `${240 + i * 60}ms`}}
            className="glass glass-hover ring-focus rise group flex items-start gap-3.5 rounded-3xl p-4 text-start hover:-translate-y-0.5"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/6 text-xl ring-1 ring-white/10">
              {CHIP_EMOJI[i]}
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-white">{c.title}</span>
              <span className="mt-0.5 line-clamp-1 block sm:line-clamp-2 text-[13px] leading-snug text-white/50">{c.prompt}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
