'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { upsertQuote, deleteQuote } from '@/lib/admin/db/queries';
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
