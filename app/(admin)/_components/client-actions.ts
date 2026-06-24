'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { createClient, updateClient, deleteClient } from '@/lib/admin/db/queries';
import type { ClientRecord } from '@/lib/admin/types';
import type { ClientRecordInput, ClientRecordPatch } from '@/app/api/admin/v1/_lib/schemas';

// Server Actions for client-directory mutations. Each action re-verifies auth
// independently because Server Actions are reachable via direct POST requests —
// a page-level auth check does not extend here (see mutating-data.md security warning).

export async function createClientAction(input: ClientRecordInput): Promise<ClientRecord> {
  const { email } = await requireAdmin();
  const record = await createClient(email, input);
  revalidatePath('/admin/clients');
  return record;
}

export async function updateClientAction(
  id: string,
  patch: ClientRecordPatch,
): Promise<ClientRecord> {
  const { email } = await requireAdmin();
  const record = await updateClient(email, id, patch);
  if (!record) throw new Error('Client not found or not owned by current user.');
  revalidatePath('/admin/clients');
  revalidatePath(`/admin/clients/${id}`);
  return record;
}

export async function deleteClientAction(id: string): Promise<void> {
  const { email } = await requireAdmin();
  await deleteClient(email, id);
  revalidatePath('/admin/clients');
}
