import {createContext, useContext, useEffect, useMemo, useState, type ReactNode} from 'react';
import {DICTS, LOCALES, LOCALE_META, type Dict, type Locale} from './locales';

const STORAGE_KEY = 'saiyakat.locale';

function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (LOCALES as readonly string[]).includes(saved)) return saved as Locale;
  } catch {
    /* storage unavailable */
  }
  for (const lang of navigator.languages ?? [navigator.language]) {
    const base = lang.toLowerCase().split('-')[0];
    if ((LOCALES as readonly string[]).includes(base)) return base as Locale;
  }
  return 'en';
}

type Ctx = {locale: Locale; t: Dict; setLocale: (l: Locale) => void};
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({children}: {children: ReactNode}) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = LOCALE_META[locale].dir;
  }, [locale]);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      t: DICTS[locale],
      setLocale: (l) => {
        setLocaleState(l);
        try {
          localStorage.setItem(STORAGE_KEY, l);
        } catch {
          /* ignore */
        }
      },
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}

export {LOCALES, LOCALE_META, type Locale};
