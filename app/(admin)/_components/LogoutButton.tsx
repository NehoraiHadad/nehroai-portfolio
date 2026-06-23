'use client';

import { LogOut } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/provider';
import { logoutAction } from './actions';

export function LogoutButton({ className = '' }: { className?: string }) {
  const { admin } = useDictionary();
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={`flex w-full items-center gap-2 rounded-[var(--r-1)] px-3 py-2 text-sm font-medium text-fg-1 transition-colors outline-none hover:bg-surface-raised hover:text-fg-0 focus-visible:[box-shadow:var(--shadow-focus-ring)] ${className}`}
      >
        <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span>{admin.topbar.logout}</span>
      </button>
    </form>
  );
}
