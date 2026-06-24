'use server';

// Public (unauthenticated) server actions for the client-facing approval page.
// Authorization model: possession of the share token IS the credential. The
// token is an unguessable capability URL fragment minted by shareQuote() and
// never shown in any index. The DAL functions called here enforce the status
// guard (only mutate when status === 'sent'), so a second click or a click on
// an already-decided quote is a safe no-op that returns null → { ok: false }.
// requireAdmin() is intentionally absent — the client has no session.

import { approveQuoteByShareToken, rejectQuoteByShareToken } from '@/lib/admin/db/queries';
import { revalidatePath } from 'next/cache';

export async function approveQuoteByTokenAction(token: string): Promise<{ ok: boolean }> {
  const result = await approveQuoteByShareToken(token);
  revalidatePath(`/q/${token}`);
  return { ok: result !== null };
}

export async function rejectQuoteByTokenAction(token: string): Promise<{ ok: boolean }> {
  const result = await rejectQuoteByShareToken(token);
  revalidatePath(`/q/${token}`);
  return { ok: result !== null };
}
