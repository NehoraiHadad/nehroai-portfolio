export const runtime = 'nodejs';

import { listQuotesByClient } from '@/lib/admin/db/queries';
import { computeTotals } from '@/lib/admin/totals';
import { authed, json, internal } from '../../../_lib/respond';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/v1/clients/:id/quotes  — list quotes linked to a directory client (concise).

export async function GET(req: Request, ctx: Ctx): Promise<Response> {
  const identity = await authed(req);
  if (identity instanceof Response) return identity;

  const { id } = await ctx.params;

  try {
    const quotes = await listQuotesByClient(identity.ownerEmail, id);
    const concise = quotes.map((q) => ({
      id: q.id,
      number: q.number,
      status: q.status,
      language: q.language,
      clientName: q.client.name,
      total: computeTotals(q.items, q.vatRate).total,
      updatedAt: q.updatedAt,
    }));
    return json(concise);
  } catch (err) {
    return internal(err);
  }
}
