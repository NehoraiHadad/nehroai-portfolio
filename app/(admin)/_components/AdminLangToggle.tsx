'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Languages } from 'lucide-react';
import { locales } from '@/lib/i18n/config';
import { useDictionary, useLocale } from '@/lib/i18n/provider';
import { setAdminLang } from './actions';

const labels: Record<(typeof locales)[number], string> = { en: 'EN', he: 'עב' };

// Flips the `admin_lang` cookie (via a server action) and refreshes so the
// server layout re-renders with the other dictionary + direction.
export function AdminLangToggle() {
  const router = useRouter();
  const locale = useLocale();
  const { admin } = useDictionary();
  const [pending, startTransition] = useTransition();

  const setLang = (next: (typeof locales)[number]) => {
    if (next === locale) return;
    startTransition(async () => {
      await setAdminLang(next);
      router.refresh();
    });
  };

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-line bg-surface p-1"
      role="group"
      aria-label={admin.topbar.language}
    >
      <Languages className="ms-1 h-3.5 w-3.5 text-fg-2" strokeWidth={1.5} aria-hidden="true" />
      {locales.map((next) => (
        <button
          key={next}
          type="button"
          lang={next}
          disabled={pending}
          aria-current={locale === next ? 'true' : undefined}
          onClick={() => setLang(next)}
          className={`min-w-9 rounded-full px-2.5 py-1 text-center text-xs font-semibold transition-colors outline-none focus-visible:[box-shadow:var(--shadow-focus-ring)] ${
            locale === next ? 'bg-accent text-[var(--fg-on-accent)]' : 'text-fg-2 hover:text-fg-0'
          }`}
        >
          {labels[next]}
        </button>
      ))}
    </div>
  );
}
