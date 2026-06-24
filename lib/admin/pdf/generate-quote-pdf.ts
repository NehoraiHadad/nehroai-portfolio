// Shared PDF generation helper — extracts the Chromium launch/navigate/render
// sequence so the HTTP route (api/admin/v1/quotes/[id]/pdf) and the MCP tool
// (get_quote_pdf) can both call it without duplicating logic.
import 'server-only';

import { launchBrowser } from './launch-browser';

/**
 * Launch Chromium, navigate to the quote-pdf render page with the caller's
 * bearer token forwarded as an Authorization header, and return the rendered
 * A4 PDF as a Buffer. Throws on failure (caller decides how to surface the
 * error; should not include the stack trace in any client-facing response).
 */
export async function generateQuotePdf(opts: {
  /** Public origin of the app, e.g. "https://nehoraihadad.com". */
  origin: string;
  /** Raw bearer token string — forwarded to the render page for auth. */
  token: string;
  /** Quote ID. */
  id: string;
}): Promise<Buffer> {
  let browser: Awaited<ReturnType<typeof launchBrowser>> | undefined;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Forward the bearer token so the render page can authenticate without a
    // session cookie. setExtraHTTPHeaders applies to every request during goto().
    await page.setExtraHTTPHeaders({ Authorization: 'Bearer ' + opts.token });

    await page.goto(opts.origin + '/quote-pdf/' + opts.id, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Block until every declared @font-face (incl. the Rubik Hebrew subset) is
    // loaded AND laid out. networkidle0 alone is NOT enough: next/font ships
    // Rubik with `display: swap`, so Chromium paints the fallback immediately
    // and substitutes the real glyphs later — and may report the page idle
    // mid-swap. On Vercel's chromium-min there is no system Hebrew fallback, so
    // any Hebrew glyph captured during that swap window drops to chromium-min's
    // minimal fallback (which lacks U+05F4 gershayim → tofu). Awaiting
    // document.fonts.ready closes that race for ALL glyphs, not just סה״כ.
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    // Renders in @media print — shared globals.css print styles apply.
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    return Buffer.from(pdf);
  } catch (err) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    console.error('[generate-quote-pdf] PDF generation failed:', err);
    throw err;
  }
}
