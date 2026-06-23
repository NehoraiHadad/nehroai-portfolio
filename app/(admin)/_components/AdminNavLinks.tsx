'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/provider';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match exactly (dashboard) vs by prefix (sections). */
  exact?: boolean;
}

export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { admin } = useDictionary();

  const items: NavItem[] = [
    { href: '/admin', label: admin.nav.dashboard, icon: LayoutDashboard, exact: true },
    { href: '/admin/clients', label: admin.nav.clients, icon: Users },
    { href: '/admin/quotes', label: admin.nav.quotes, icon: FileText },
    { href: '/admin/settings', label: admin.nav.settings, icon: Settings },
  ];

  return (
    <nav className="flex flex-col gap-1" aria-label={admin.appName}>
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-[var(--r-1)] px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:[box-shadow:var(--shadow-focus-ring)] ${
              active
                ? 'bg-accent-dim text-accent-pale'
                : 'text-fg-1 hover:bg-surface-raised hover:text-fg-0'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
