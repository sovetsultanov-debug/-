import {createContext, useCallback, useContext, useEffect, useState, type ReactNode} from 'react';

export type Theme = 'cinema' | 'silver';
const KEY = 'saiyakat.theme';

function initialTheme(): Theme {
  // public/theme-init.js already applied the saved theme before first paint.
  const t = document.documentElement.dataset.theme;
  return t === 'silver' ? 'silver' : 'cinema';
}

type Ctx = {theme: Theme; toggle: () => void};
const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({children}: {children: ReactNode}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'silver' ? '#e9e9ec' : '#0a0a0b');
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'cinema' ? 'silver' : 'cinema')), []);
  return <ThemeContext.Provider value={{theme, toggle}}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
