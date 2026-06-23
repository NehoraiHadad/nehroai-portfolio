'use client';

import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/provider';
import { computeTotals, formatMoney } from '@/lib/admin/totals';
import { QuoteStatusBadge } from './QuoteStatusBadge';
import type { QuoteDoc } from '@/lib/admin/types';

export function QuotesListContent({ quotes }: { quotes: QuoteDoc[] }) {
  const { admin } = useDictionary();

  if (quotes.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 p-10 text-center">
        <FileText className="h-8 w-8 text-fg-3" strokeWidth={1.5} aria-hidden="true" />
        <p className="text-sm text-fg-1">{admin.quotes.empty}</p>
        <Link href="/admin/quotes/new" className="btn btn-primary btn-sm">
          <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {admin.quotes.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto scrollbar-slim">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{admin.quotes.colNumber}</th>
              <th>{admin.quotes.colClient}</th>
              <th>{admin.quotes.colStatus}</th>
              <th className="text-end">{admin.quotes.colTotal}</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => {
              const totals = computeTotals(q.items, q.vatRate);
              return (
                <tr key={q.id} className="transition-colors hover:bg-surface-raised">
                  <td>
                    <Link
                      href={`/admin/quotes/${q.id}`}
                      className="font-mono text-xs text-accent-text outline-none hover:underline focus-visible:[box-shadow:var(--shadow-focus-ring)]"
                    >
                      {q.number}
                    </Link>
                  </td>
                  <td>
                    <span className="block text-fg-0">{q.client.name || admin.quotes.untitled}</span>
                    {q.client.company && <span className="block text-xs text-fg-2">{q.client.company}</span>}
                  </td>
                  <td><QuoteStatusBadge status={q.status} /></td>
                  <td className="admin-num text-end text-fg-1">{formatMoney(totals.total, q.language)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
