export const runtime = 'nodejs';

import { listQuotes } from '@/lib/admin/db/queries';
import { computeTotals } from '@/lib/admin/totals';
import { buildAndCreateQuote } from '@/lib/admin/build-quote';
import { zCreateQuoteInput } from '../_lib/schemas';
import { authed, json, validationError, internal } from '../_lib/respond';

// GET  /api/admin/v1/quotes  — list quotes for the authenticated owner.
// POST /api/admin/v1/quotes  — create a new quote; returns 201 + the full doc.

export async function GET(req: Request): Promise<Response> {
  const id = await authed(req);
  if (id instanceof Response) return id;

  try {
    const quotes = await listQuotes(id.ownerEmail);
    const url = new URL(req.url);
    const format = url.searchParams.get('format') ?? 'concise';

    if (format === 'detailed') {
      return json(quotes);
    }

    // concise — just the fields a listing UI or agent triage needs.
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

export async function POST(req: Request): Promise<Response> {
  const id = await authed(req);
  if (id instanceof Response) return id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(
      { error: { code: 'validation_error', message: 'Request body must be valid JSON.' } },
      { status: 400 },
    );
  }

  const parsed = zCreateQuoteInput.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const quote = await buildAndCreateQuote(id.ownerEmail, parsed.data);
    return json(quote, { status: 201 });
  } catch (err) {
    return internal(err);
  }
}
