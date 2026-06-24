/**
 * PDF generation route handler.
 *
 * Strategy: launch headless Chromium, forward the caller's session cookie so
 * the preview page renders as the authenticated admin, navigate to the existing
 * /admin/quotes/[id]/preview page (which already has correct @media print CSS),
 * and call page.pdf(). The preview page renders only the quote sheet in print
 * media — the toolbar (.no-print) is hidden automatically by the CSS.
 *
 * Auth: we forward ALL incoming cookies verbatim. The session cookie is named
 *   authjs.session-token      (dev / HTTP)
 *   __Secure-authjs.session-token  (prod / HTTPS)
 * Both are forwarded because we forward everything — no need to pick by name.
 *
 * Local dev: uses the installed Windows Chrome (LOCAL_CHROME_PATH env var, or
 *   the default Chrome path). No Chromium download needed.
 * Vercel / serverless: uses @sparticuz/chromium's bundled headless Chromium.
 */

import { requireAdmin } from '@/lib/admin/auth';
import { getQuote } from '@/lib/admin/db/queries';

export const runtime = 'nodejs';
// 300s ceiling — generous headroom for Chromium cold starts. Hobby allows up to
// 300s; Pro up to far more. Real PDF runs are a few seconds; this is only a cap.
export const maxDuration = 300;

/** Launch Chromium: bundled sparticuz binary on Vercel, local Chrome elsewhere. */
async function launchBrowser() {
  // Dynamic imports so bundler never tries to tree-shake these out
  const puppeteer = (await import('puppeteer-core')).default;

  if (process.env.VERCEL) {
    const chromium = (await import('@sparticuz/chromium')).default;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const executablePath =
    process.env.LOCAL_CHROME_PATH ||
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  return puppeteer.launch({ executablePath, headless: true });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Auth guard — redirects to /admin/login if not authenticated or not allowlisted
  const user = await requireAdmin();

  const { id } = await params;

  const quote = await getQuote(user.email, id);
  if (!quote) {
    return new Response('Not found', { status: 404 });
  }

  let browser: Awaited<ReturnType<typeof launchBrowser>> | undefined;

  try {
    const origin = new URL(request.url).origin;
    const host = new URL(request.url).hostname;
    // In prod the session cookie is named `__Secure-authjs.session-token`; the
    // `__Secure-` prefix means Chromium will REJECT the cookie unless it is set
    // with secure:true over an https origin. Mark cookies secure on https so the
    // forwarded session is accepted and the preview renders authenticated.
    const secure = origin.startsWith('https');

    // Parse the raw cookie header into {name, value} pairs so we can set them
    // on the Puppeteer page context, which authenticates the preview navigation.
    const rawCookie = request.headers.get('cookie') ?? '';
    const cookiePairs = rawCookie
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair) => {
        const eqIdx = pair.indexOf('=');
        if (eqIdx === -1) return null;
        return {
          name: pair.slice(0, eqIdx).trim(),
          value: pair.slice(eqIdx + 1).trim(),
        };
      })
      .filter((c): c is { name: string; value: string } => c !== null);

    browser = await launchBrowser();
    const page = await browser.newPage();

    // Inject the admin's session cookies so the preview page is served
    // to an authenticated user — otherwise requireAdmin() would redirect us
    // to /admin/login and we'd get a blank/login PDF.
    if (cookiePairs.length > 0) {
      await page.setCookie(
        ...cookiePairs.map((c) => ({
          name: c.name,
          value: c.value,
          domain: host,
          path: '/',
          secure,
        })),
      );
    }

    await page.goto(`${origin}/admin/quotes/${id}/preview`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // page.pdf() renders in @media print — the existing print CSS in
    // app/globals.css is applied automatically; we do NOT modify it.
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    // Use quote.number for the filename (ASCII-safe: NH-2026-0001 format)
    const filename = (quote.number || 'quote').replace(/[^A-Za-z0-9\-_]/g, '_');

    return new Response(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
      },
    });
  } catch (err) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    console.error('[pdf/route] PDF generation failed:', err);
    return new Response('PDF generation failed', { status: 500 });
  }
}
