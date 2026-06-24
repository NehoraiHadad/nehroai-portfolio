export const runtime = 'nodejs';

import { getQuote, upsertQuote, deleteQuote } from '@/lib/admin/db/queries';
import { applyQuotePatch } from '@/lib/admin/build-quote';
import { zPatchQuoteInput } from '../../_lib/schemas';
import { authed, json, notFound, validationError, internal } from '../../_lib/respond';

type Ctx = { params: Promise<{ id: string }> };

// GET    /api/admin/v1/quotes/:id  — fetch a single quote.
// PATCH  /api/admin/v1/quotes/:id  — partial update; returns the updated doc.
// DELETE /api/admin/v1/quotes/:id  — delete; returns { ok: true }.

export async function GET(req: Request, ctx: Ctx): Promise<Response> {
  const identity = await authed(req);
  if (identity instanceof Response) return identity;

  const { id } = await ctx.params;

  try {
    const quote = await getQuote(identity.ownerEmail, id);
    if (!quote) return notFound();
    return json(quote);
  } catch (err) {
    return internal(err);
  }
}

export async function PATCH(req: Request, ctx: Ctx): Promise<Response> {
  const identity = await authed(req);
  if (identity instanceof Response) return identity;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(
      { error: { code: 'validation_error', message: 'Request body must be valid JSON.' } },
      { status: 400 },
    );
  }

  const parsed = zPatchQuoteInput.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const existing = await getQuote(identity.ownerEmail, id);
    if (!existing) return notFound();

    const updated = await upsertQuote(
      identity.ownerEmail,
      applyQuotePatch(existing, parsed.data),
    );
    return json(updated);
  } catch (err) {
    return internal(err);
  }
}

export async function DELETE(req: Request, ctx: Ctx): Promise<Response> {
  const identity = await authed(req);
  if (identity instanceof Response) return identity;

  const { id } = await ctx.params;

  try {
    const existing = await getQuote(identity.ownerEmail, id);
    if (!existing) return notFound();

    await deleteQuote(identity.ownerEmail, id);
    return json({ ok: true });
  } catch (err) {
    return internal(err);
  }
}
