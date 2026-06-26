export const runtime = 'nodejs';

import { getPublicOrigin } from 'mcp-handler';
import { shareQuote } from '@/lib/admin/db/queries';
import { buildShareUrl, resolveShareOrigin } from '@/lib/admin/share-url';
import { authed, json, notFound, internal } from '../../../_lib/respond';

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/v1/quotes/:id/share — mint (or fetch) the public approval link
// for a quote and advance it to `sent`. Idempotent: repeated calls return the
// same link. Returns { url, quote }.
export async function POST(req: Request, ctx: Ctx): Promise<Response> {
  const identity = await authed(req);
  if (identity instanceof Response) return identity;

  const { id } = await ctx.params;

  try {
    const quote = await shareQuote(identity.ownerEmail, id);
    if (!quote || !quote.shareToken) return notFound();
    // PUBLIC_APP_ORIGIN is the source of truth; the request origin is only a
    // dev fallback. Both resolve to the public host that serves /q/<token>.
    const origin = resolveShareOrigin(getPublicOrigin(req));
    if (!origin) return internal(new Error('PUBLIC_APP_ORIGIN is not configured.'));
    const url = buildShareUrl(origin, quote.shareToken);
    return json({ url, quote });
  } catch (err) {
    return internal(err);
  }
}
