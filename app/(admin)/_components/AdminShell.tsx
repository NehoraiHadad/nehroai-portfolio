'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import type { AdminUser } from '@/lib/admin/auth';
import { useDictionary } from '@/lib/i18n/provider';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { AdminNavLinks } from './AdminNavLinks';
import { AdminLangToggle } from './AdminLangToggle';
import { LogoutButton } from './LogoutButton';

function initials(name: string | null, email: string): string {
  const source = (name ?? email).trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function BrandHeader() {
  const { admin } = useDictionary();
  return (
    <div className="flex h-[var(--header-h)] items-center gap-2 px-5">
      <span className="grid h-8 w-8 place-items-center rounded-[var(--r-1)] bg-accent text-[var(--fg-on-accent)] font-mono text-sm font-bold" aria-hidden="true">
        NH
      </span>
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-fg-2">{admin.appName}</span>
    </div>
  );
}

function UserCard({ user }: { user: AdminUser }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--r-1)] px-3 py-2">
      {user.image ? (
        <Image src={user.image} alt="" width={32} height={32} className="h-8 w-8 rounded-full" unoptimized />
      ) : (
        <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-raised text-xs font-semibold text-fg-1" aria-hidden="true">
          {initials(user.name, user.email)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        {user.name && <p className="truncate text-sm font-medium text-fg-0">{user.name}</p>}
        <p className="truncate text-xs text-fg-2" dir="ltr" style={{ textAlign: 'start' }}>{user.email}</p>
      </div>
    </div>
  );
}

function SidebarBody({ user, onNavigate }: { user: AdminUser; onNavigate?: () => void }) {
  return (
    <>
      <BrandHeader />
      <div className="flex-1 overflow-y-auto scrollbar-slim px-3 py-2">
        <AdminNavLinks onNavigate={onNavigate} />
      </div>
      <div className="border-t border-line p-3">
        <UserCard user={user} />
        <LogoutButton />
      </div>
    </>
  );
}

export function AdminShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const { admin } = useDictionary();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useFocusTrap<HTMLDivElement>({ active: drawerOpen, restoreRef: menuButtonRef });

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar — fixed on the inline-start edge (RTL-aware) */}
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 flex-col border-e border-line bg-surface md:flex no-print">
        <SidebarBody user={user} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden no-print" role="dialog" aria-modal="true" aria-label={admin.appName}>
          <button
            type="button"
            aria-label={admin.topbar.closeMenu}
            className="absolute inset-0 bg-[color-mix(in_oklab,var(--bg-0)_70%,transparent)] backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            ref={drawerRef}
            className="absolute inset-y-0 start-0 flex w-72 max-w-[80%] flex-col border-e border-line bg-surface shadow-[var(--shadow-3)]"
            onKeyDown={(e) => { if (e.key === 'Escape') setDrawerOpen(false); }}
          >
            <SidebarBody user={user} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-h-screen flex-col md:ms-64 admin-main">
        <header className="sticky top-0 z-30 flex h-[var(--header-h)] items-center gap-3 border-b border-line bg-[color-mix(in_oklab,var(--bg-0)_70%,transparent)] px-4 backdrop-blur-[12px] sm:px-6 no-print">
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={admin.topbar.openMenu}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--r-1)] text-fg-1 outline-none hover:text-fg-0 focus-visible:[box-shadow:var(--shadow-focus-ring)] md:hidden"
          >
            {drawerOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <div className="flex-1" />
          <AdminLangToggle />
          <ThemeToggle />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 admin-content">{children}</main>
      </div>
    </div>
  );
}
