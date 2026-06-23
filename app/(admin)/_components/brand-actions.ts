'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { saveBrand } from '@/lib/admin/db/queries';
import type { BrandProfile } from '@/lib/admin/types';

/**
 * Server Action: persist the brand profile for the current admin.
 * Re-checks auth itself because Server Actions are reachable via direct POST.
 */
export async function saveBrandAction(profile: BrandProfile): Promise<void> {
  const { email } = await requireAdmin();
  await saveBrand(email, profile);
  revalidatePath('/admin/settings');
  revalidatePath('/admin/quotes');
}
