'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/provider';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';
const EVENT = 'nehorai:themechange';

// The theme lives on <html data-theme> (set pre-hydration by ThemeScript).
// We treat the DOM as the source of truth and subscribe to our own event,
// so there is no setState-in-effect and no hydration mismatch warning.
const subscribe = (onChange: () => void) => {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
};
const getSnapshot = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
const getServerSnapshot = (): Theme => 'dark';

export const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { a11y } = useDictionary();
  const isLight = theme === 'light';

  const toggle = () => {
    const next: Theme = isLight ? 'dark' : 'light';
    if (next === 'light') {
      document.documentElement.dataset.theme = 'light';
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — runtime toggle still works for the session */
    }
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    // 4.6: h-11 w-11 = 44px touch target; 4.2: localized aria-label from dictionary
    <button
      type="button"
      onClick={toggle}
      aria-label={a11y.themeToggle}
      title={isLight ? 'Dark' : 'Light'}
      className={`corner-chip rounded-[var(--r-1)] text-fg-1 hover:bg-surface-raised hover:text-fg-0 focus-visible:[box-shadow:var(--shadow-focus-ring)] outline-none ${className}`}
    >
      {isLight ? <Moon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> : <Sun className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
    </button>
  );
};
