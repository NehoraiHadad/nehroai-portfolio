'use client';

import { useEffect, useState } from 'react';
import { useDictionary } from '@/lib/i18n/provider';
import { getQuote } from '@/lib/admin/quotes-store';
import { loadBrandProfile } from '@/lib/admin/brand';
import { QuotePreview } from './QuotePreview';
import { QuotePreviewActions } from './QuotePreviewActions';
import type { QuoteDoc, BrandProfile } from '@/lib/admin/types';

// Client island: loads quote + brand from localStorage after mount, then
// delegates to the pure presentation components. The server page cannot reach
// localStorage, so this wrapper handles the client-only hydration step.
// An explicit loading state prevents a flash of the "not found" message on
// the initial render before localStorage is read.

type LoadState =
  | { phase: 'loading' }
  | { phase: 'found'; quote: QuoteDoc; brand: BrandProfile }
  | { phase: 'not-found' };

export function QuotePreviewClient({ email, quoteId }: { email: string; quoteId: string }) {
  const { admin } = useDictionary();
  const [state, setState] = useState<LoadState>({ phase: 'loading' });

  useEffect(() => {
    const quote = getQuote(email, quoteId);
    if (!quote) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ phase: 'not-found' });
      return;
    }
    const brand = loadBrandProfile(email, quote.language);
    setState({ phase: 'found', quote, brand });
  }, [email, quoteId]);

  if (state.phase === 'loading') {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <span className="text-sm text-fg-2">{admin.preview.title}…</span>
      </div>
    );
  }

  if (state.phase === 'not-found') {
    return (
      <div className="card mx-auto max-w-3xl p-10 text-center">
        <p className="text-sm text-fg-1">{admin.preview.title} — {quoteId}</p>
        <p className="mt-2 text-xs text-fg-2">{admin.quotes.untitled}</p>
      </div>
    );
  }

  const { quote, brand } = state;

  return (
    <>
      <QuotePreviewActions email={email} quote={quote} />
      <QuotePreview quote={quote} brand={brand} />
    </>
  );
}
