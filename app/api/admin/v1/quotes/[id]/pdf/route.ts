/**
 * Agent PDF endpoint — generates a quote PDF and returns it as
 * application/pdf. Authenticates via bearer token (no session cookie). Chromium
 * navigates to the dedicated /quote-pdf/[id] render page, forwarding the token
 * in an Authorization header so that page can authenticate without a cookie.
 *
 * The Chromium launch/navigate/render sequence lives in generateQuotePdf() so
 * the MCP get_quote_pdf tool can call the same code without duplication.
 */
export const runtime = 'nodejs';
// 300s ceiling — generous headroom for Chromium cold starts. Hobby allows up to
// 300s; Pro up to far more. Real PDF runs are a few seconds; this is only a cap.
export const maxDuration = 300;

import { getQuote } from '@/lib/admin/db/queries';
import { generateQuotePdf } from '@/lib/admin/pdf/generate-quote-pdf';
import { authed, notFound, internal } from '../../../_lib/respond';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx): Promise<Response> {
  const identity = await authed(req);
  if (identity instanceof Response) return identity;

  // Re-extract the raw token so we can forward it to the Chromium page.
  // authed() already validated it — this is just string slicing.
  const rawAuthz = req.headers.get('authorization') ?? '';
  const token = rawAuthz.slice(rawAuthz.toLowerCase().indexOf('bearer ') + 'bearer '.length).trim();

  const { id } = await ctx.params;

  const quote = await getQuote(identity.ownerEmail, id);
  if (!quote) return notFound('Quote not found.');

  try {
    const origin = new URL(req.url).origin;
    const pdf = await generateQuotePdf({ origin, token, id });

    // Use quote.number for the filename (ASCII-safe: NH-2026-0001 format)
    const filename = (quote.number || 'quote').replace(/[^A-Za-z0-9\-_]/g, '_');

    // Puppeteer returns a Node Buffer; copy to a plain ArrayBuffer for the DOM
    // Response constructor (Buffer's underlying ArrayBufferLike can be a
    // SharedArrayBuffer which BodyInit does not accept).
    const pdfBuf = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
    return new Response(pdfBuf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    // Log server-side; return a sanitised error to the caller (no stack traces).
    return internal(err);
  }
}
