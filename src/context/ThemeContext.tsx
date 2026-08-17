import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Theme, ThemeContextType } from '@/types';
import { THEME_STORAGE_KEY } from '@/constants';
import { useAnonymous } from '@/context/AnonymousContext';

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextType | null>(null);

// Written by the WelcomeModal when the visitor dismisses it — the moment they
// "join" the platform.
const WELCOME_SEEN_KEY = 'see-through-welcome-seen';

/** True once the visitor has dismissed the welcome page (i.e. joined). */
function hasJoined(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(WELCOME_SEEN_KEY) === 'true';
}

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : null;
}

/**
 * The whole platform defaults to LIGHT mode. While the welcome page is the
 * visitor's first page (they have not dismissed it / "joined" yet), light is
 * forced — the OS color-scheme preference and any stored dark choice are
 * ignored. After joining, their stored preference (default: light) takes over
 * and the navbar toggle switches the app freely.
 */
function getInitialTheme(): Theme {
  if (!hasJoined()) return 'light';
  return getStoredTheme() ?? 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { identity } = useAnonymous();
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // While the welcome page is the visitor's first page (onboarding not yet
  // completed), the platform stays in light mode. This also covers the case
  // where the backend minted a brand-new identity (the previous one was
  // deleted by an admin) — the visitor starts from scratch, so light mode is
  // restored until they join again.
  useEffect(() => {
    if (!identity) return;
    if (localStorage.getItem(WELCOME_SEEN_KEY) !== 'true') {
      setThemeState('light');
    }
  }, [identity]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
