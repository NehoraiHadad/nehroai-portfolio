'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/provider';
import { useQuotes } from '@/lib/admin/quotes-store';
import { computeTotals, formatMoney } from '@/lib/admin/totals';
import { QuoteStatusBadge } from './QuoteStatusBadge';

export function DashboardContent({ email }: { email: string }) {
  const { admin } = useDictionary();
  const quotes = useQuotes(email);

  const drafts = quotes.filter((q) => q.status === 'draft').length;
  const sent = quotes.filter((q) => q.status === 'sent').length;
  const approved = quotes.filter((q) => q.status === 'approved').length;
  const recent = quotes.slice(0, 5);

  const stats = [
    { label: admin.dashboard.statDrafts, value: drafts },
    { label: admin.dashboard.statSent, value: sent },
    { label: admin.dashboard.statApproved, value: approved },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-2 text-[var(--t-36)] font-extrabold leading-none text-fg-0 nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="!mb-0 text-[var(--t-20)]">{admin.dashboard.recentQuotes}</h2>
          <Link href="/admin/quotes/new" className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            {admin.dashboard.quickNewQuote}
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-fg-2">{admin.dashboard.emptyHint}</p>
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {recent.map((q) => {
              const totals = computeTotals(q.items, q.vatRate);
              return (
                <li key={q.id}>
                  <Link
                    href={`/admin/quotes/${q.id}`}
                    className="flex items-center justify-between gap-3 py-3 text-sm outline-none hover:text-accent focus-visible:[box-shadow:var(--shadow-focus-ring)]"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="font-mono text-xs text-fg-2">{q.number}</span>
                      <span className="truncate text-fg-0">
                        {q.projectTitle || q.client.name || admin.quotes.untitled}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="nums text-fg-1">{formatMoney(totals.total, q.language)}</span>
                      <QuoteStatusBadge status={q.status} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
