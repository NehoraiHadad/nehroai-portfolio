export const runtime = 'nodejs';

import { getBrand, saveBrand } from '@/lib/admin/db/queries';
import type { BrandProfile, QuoteLanguage } from '@/lib/admin/types';
import { zBrandInput } from '../_lib/schemas';
import { authed, json, validationError, internal } from '../_lib/respond';

// GET /api/admin/v1/brand?language=he|en  — fetch the current brand profile.
// PUT /api/admin/v1/brand                 — merge provided fields; returns updated profile.

export async function GET(req: Request): Promise<Response> {
  const identity = await authed(req);
  if (identity instanceof Response) return identity;

  const url = new URL(req.url);
  const lang = url.searchParams.get('language');
  const language: QuoteLanguage = lang === 'he' ? 'he' : 'en';

  try {
    const profile = await getBrand(identity.ownerEmail, language);
    return json(profile);
  } catch (err) {
    return internal(err);
  }
}

export async function PUT(req: Request): Promise<Response> {
  const identity = await authed(req);
  if (identity instanceof Response) return identity;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(
      { error: { code: 'validation_error', message: 'Request body must be valid JSON.' } },
      { status: 400 },
    );
  }

  const parsed = zBrandInput.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    // Merge over the existing profile — only provided fields are overwritten.
    const current = await getBrand(identity.ownerEmail, 'en');
    const merged: BrandProfile = {
      name: parsed.data.name ?? current.name,
      tagline: parsed.data.tagline ?? current.tagline,
      email: parsed.data.email ?? current.email,
      phone: parsed.data.phone ?? current.phone,
      address: parsed.data.address ?? current.address,
      logoUrl: parsed.data.logoUrl ?? current.logoUrl,
    };
    await saveBrand(identity.ownerEmail, merged);
    return json(merged);
  } catch (err) {
    return internal(err);
  }
}
