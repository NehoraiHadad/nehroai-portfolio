'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { upsertQuote, deleteQuote, shareQuote } from '@/lib/admin/db/queries';
import { buildShareUrl, resolveShareOrigin } from '@/lib/admin/share-url';
import type { QuoteDoc } from '@/lib/admin/types';

// Server Actions for quote mutations. Each action re-verifies auth independently
// because Server Actions are reachable via direct POST requests — a page-level
// auth check does not extend here (see mutating-data.md security warning).

export async function saveQuoteAction(quote: QuoteDoc): Promise<QuoteDoc> {
  const { email } = await requireAdmin();
  const saved = await upsertQuote(email, quote);
  revalidatePath('/admin/quotes');
  revalidatePath('/admin');
  return saved;
}

export async function deleteQuoteAction(id: string): Promise<void> {
  const { email } = await requireAdmin();
  await deleteQuote(email, id);
  revalidatePath('/admin/quotes');
  revalidatePath('/admin');
}

/**
 * Generate (or fetch the existing) public approval link for a quote and advance
 * it to `sent`. Owner-scoped via requireAdmin → shareQuote. Returns the absolute
 * URL the owner can hand to the client, plus the updated quote.
 */
export async function shareQuoteAction(
  id: string,
): Promise<{ url: string; quote: QuoteDoc }> {
  const { email } = await requireAdmin();
  const quote = await shareQuote(email, id);
  if (!quote || !quote.shareToken) {
    throw new Error('Quote not found.');
  }
  // Share links go to the PUBLIC app origin (PUBLIC_APP_ORIGIN), not this admin
  // host — admin.* redirects /q/* to the dashboard. The request host is only a
  // dev fallback (localhost) when PUBLIC_APP_ORIGIN is unset.
  const h = await headers();
  const host = h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https');
  const origin = resolveShareOrigin(host ? `${proto}://${host}` : null);
  if (!origin) {
    throw new Error('Cannot build share link: set PUBLIC_APP_ORIGIN to the public app origin.');
  }
  const url = buildShareUrl(origin, quote.shareToken);
  revalidatePath('/admin/quotes');
  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath(`/admin/quotes/${id}/preview`);
  return { url, quote };
}
