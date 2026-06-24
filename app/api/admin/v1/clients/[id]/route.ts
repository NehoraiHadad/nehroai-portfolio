export const runtime = 'nodejs';

import { getClient, updateClient, deleteClient } from '@/lib/admin/db/queries';
import { zClientRecordPatch } from '../../_lib/schemas';
import { authed, json, notFound, validationError, internal } from '../../_lib/respond';

type Ctx = { params: Promise<{ id: string }> };

// GET    /api/admin/v1/clients/:id  — fetch a single directory client.
// PATCH  /api/admin/v1/clients/:id  — partial update; returns the updated record.
// DELETE /api/admin/v1/clients/:id  — delete; returns { ok: true }.

export async function GET(req: Request, ctx: Ctx): Promise<Response> {
  const identity = await authed(req);
  if (identity instanceof Response) return identity;

  const { id } = await ctx.params;

  try {
    const record = await getClient(identity.ownerEmail, id);
    if (!record) return notFound();
    return json(record);
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

  const parsed = zClientRecordPatch.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const updated = await updateClient(identity.ownerEmail, id, parsed.data);
    if (!updated) return notFound();
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
    const existing = await getClient(identity.ownerEmail, id);
    if (!existing) return notFound();

    await deleteClient(identity.ownerEmail, id);
    return json({ ok: true });
  } catch (err) {
    return internal(err);
  }
}
