import {useEffect, useRef, useState} from 'react';
import {Check, Globe} from 'lucide-react';
import {LOCALES, LOCALE_META, useI18n} from '../i18n';

export function LanguageMenu() {
  const {locale, setLocale, t} = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.language}
        className="glass glass-hover ring-focus flex h-10 items-center gap-2 rounded-full px-3.5 text-sm text-fg/85"
      >
        <Globe className="size-4 text-fg/70" />
        <span className="hidden sm:inline">{LOCALE_META[locale].name}</span>
        <span className="uppercase sm:hidden">{locale}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t.language}
          className="glass-strong rise absolute end-0 top-12 z-50 w-52 overflow-hidden rounded-2xl p-1.5"
        >
          {LOCALES.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                dir={LOCALE_META[l].dir}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className="ring-focus flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm text-fg/85 transition-colors hover:bg-fg/8"
              >
                <span>{LOCALE_META[l].name}</span>
                {l === locale && <Check className="size-4 text-gold" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
