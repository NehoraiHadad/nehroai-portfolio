'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { createApiToken, listApiTokens, revokeApiToken } from '@/lib/admin/db/queries';
import type { ApiTokenRow } from '@/lib/admin/db/queries';

export async function createTokenAction(
  label: string,
): Promise<{ id: string; token: string; prefix: string }> {
  const { email } = await requireAdmin();
  const trimmed = label.trim();
  const result = await createApiToken(email, { label: trimmed || '' });
  revalidatePath('/admin/settings');
  return result;
}

export async function listTokensAction(): Promise<ApiTokenRow[]> {
  const { email } = await requireAdmin();
  return listApiTokens(email);
}

export async function revokeTokenAction(id: string): Promise<void> {
  const { email } = await requireAdmin();
  await revokeApiToken(email, id);
  revalidatePath('/admin/settings');
}
