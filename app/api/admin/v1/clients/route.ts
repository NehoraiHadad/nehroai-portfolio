export const runtime = 'nodejs';

import { listClients, createClient } from '@/lib/admin/db/queries';
import { zClientRecordInput } from '../_lib/schemas';
import { authed, json, validationError, internal } from '../_lib/respond';

// GET  /api/admin/v1/clients  — list all directory clients for the authenticated owner.
// POST /api/admin/v1/clients  — create a new client record; returns 201 + the record.

export async function GET(req: Request): Promise<Response> {
  const identity = await authed(req);
  if (identity instanceof Response) return identity;

  try {
    const records = await listClients(identity.ownerEmail);
    return json(records);
  } catch (err) {
    return internal(err);
  }
}

export async function POST(req: Request): Promise<Response> {
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

  const parsed = zClientRecordInput.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const record = await createClient(identity.ownerEmail, parsed.data);
    return json(record, { status: 201 });
  } catch (err) {
    return internal(err);
  }
}
