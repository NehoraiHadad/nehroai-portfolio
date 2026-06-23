'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { useDictionary, useLocale } from '@/lib/i18n/provider';
import type { BrandProfile } from '@/lib/admin/types';
import { defaultBrandProfile, loadBrandProfile, saveBrandProfile } from '@/lib/admin/brand';

export function SettingsForm({ email }: { email: string }) {
  const { admin } = useDictionary();
  const language = useLocale();
  // Initial render uses non-storage defaults (SSR-safe); real values hydrate in the effect.
  const [profile, setProfile] = useState<BrandProfile>(() => defaultBrandProfile(language));
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Hydrate from localStorage after mount (SSR-safe). Re-seeds the localized
    // default name/tagline if the admin language changes and nothing is stored.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(loadBrandProfile(email, language));
  }, [email, language]);

  useEffect(() => () => { if (savedTimer.current) clearTimeout(savedTimer.current); }, []);

  const set = (key: keyof BrandProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((p) => ({ ...p, [key]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveBrandProfile(email, profile);
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2000);
  };

  const s = admin.settings;
  const fields: { key: keyof BrandProfile; label: string; hint?: string; type?: string }[] = [
    { key: 'name', label: s.brandName },
    { key: 'tagline', label: s.brandTagline },
    { key: 'email', label: s.brandEmail, type: 'email' },
    { key: 'phone', label: s.brandPhone, type: 'tel' },
    { key: 'address', label: s.brandAddress },
    { key: 'logoUrl', label: s.brandLogo, hint: s.brandLogoHint, type: 'url' },
  ];

  return (
    <form onSubmit={onSubmit} className="card flex flex-col gap-4 p-5">
      <div>
        <h2 className="!mb-0 text-[var(--t-20)]">{s.brandSection}</h2>
        <p className="text-xs text-fg-2">{s.brandSectionHint}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={`admin-field ${f.key === 'address' || f.key === 'logoUrl' ? 'sm:col-span-2' : ''}`}>
            <label className="admin-label" htmlFor={`brand-${f.key}`}>
              {f.label}
              {f.hint && <span className="admin-label__optional"> — {f.hint}</span>}
            </label>
            <input
              id={`brand-${f.key}`}
              type={f.type ?? 'text'}
              className="admin-input"
              value={profile[f.key]}
              onChange={set(f.key)}
              dir={f.key === 'email' || f.key === 'logoUrl' ? 'ltr' : undefined}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-primary btn-sm">{s.save}</button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ok)]" role="status">
            <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            {s.saved}
          </span>
        )}
      </div>
    </form>
  );
}
