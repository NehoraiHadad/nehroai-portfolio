'use client';

// Client component: approve / reject buttons shown to the quote recipient.
// Uses useTransition so the UI shows a "processing" label during the server
// action round-trip, then calls router.refresh() to let the parent server page
// re-render with the updated status banner. The server action itself is the
// authoritative guard — clicking twice or after a status change returns
// { ok: false } without throwing, so we handle that gracefully with the same
// error state as a network failure.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/provider';
import { approveQuoteByTokenAction, rejectQuoteByTokenAction } from '../_actions';

interface PublicQuoteActionsProps {
  token: string;
}

export function PublicQuoteActions({ token }: PublicQuoteActionsProps) {
  const { admin } = useDictionary();
  const t = admin.publicQuote;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleApprove = () => {
    if (!window.confirm(t.approveConfirm)) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await approveQuoteByTokenAction(token);
        if (!res.ok) {
          // Quote was already decided or token invalid — refresh to show the
          // current server-side state rather than a confusing error.
          router.refresh();
          return;
        }
        router.refresh();
      } catch {
        setError(t.errorBody);
      }
    });
  };

  const handleReject = () => {
    if (!window.confirm(t.rejectConfirm)) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await rejectQuoteByTokenAction(token);
        if (!res.ok) {
          router.refresh();
          return;
        }
        router.refresh();
      } catch {
        setError(t.errorBody);
      }
    });
  };

  return (
    <div className="no-print mx-auto mb-6 flex max-w-3xl flex-col gap-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Approve — primary CTA */}
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          aria-disabled={isPending}
          className="btn btn-primary btn-sm"
        >
          <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {isPending ? t.processing : t.approve}
        </button>

        {/* Reject — secondary / danger-tinted */}
        <button
          type="button"
          onClick={handleReject}
          disabled={isPending}
          aria-disabled={isPending}
          className="btn btn-secondary btn-sm"
          style={{ color: 'var(--danger)', borderColor: 'var(--danger-dim)' }}
        >
          <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {isPending ? t.processing : t.reject}
        </button>
      </div>

      {/* Inline error — shown only on unexpected failure */}
      {error && (
        <p
          role="alert"
          className="text-center text-sm"
          style={{ color: 'var(--danger)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
