'use client';

import type { QuoteStatus } from '@/lib/admin/types';
import { useDictionary } from '@/lib/i18n/provider';

// Status pill. Color + text together (never color alone) for a11y. Tokens only.
const STYLES: Record<QuoteStatus, string> = {
  draft: 'bg-surface-raised text-fg-1 border-line',
  sent: 'bg-accent-dim text-accent-pale border-accent',
  approved: 'bg-[var(--ok-dim)] text-[var(--ok)] border-[var(--ok)]',
  rejected: 'bg-[var(--danger-dim)] text-[var(--danger)] border-[var(--danger)]',
  expired: 'bg-surface-raised text-fg-2 border-line-strong',
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const { admin } = useDictionary();
  return (
    <span
      className={`inline-flex items-center rounded-[var(--r-pill)] border px-2.5 py-0.5 font-mono text-[var(--t-12)] font-medium uppercase tracking-[var(--ls-wide)] ${STYLES[status]}`}
    >
      {admin.status[status]}
    </span>
  );
}
