/**
 * Shared Chromium launcher for PDF generation routes.
 *
 * Local dev: uses the installed Windows Chrome (LOCAL_CHROME_PATH env var, or
 *   the default Chrome path). No Chromium download needed.
 * Vercel / serverless: uses @sparticuz/chromium's bundled headless Chromium.
 */
import 'server-only';

/** Launch Chromium: bundled sparticuz binary on Vercel, local Chrome elsewhere. */
export async function launchBrowser() {
  // Dynamic imports so bundler never tries to tree-shake these out
  const puppeteer = (await import('puppeteer-core')).default;

  if (process.env.VERCEL) {
    // Serverless: use @sparticuz/chromium-min and fetch the matching Chromium
    // pack from a URL at runtime. We do NOT bundle the ~64MB binary into the
    // function — Turbopack's build ignores outputFileTracingIncludes, so the
    // bundled-binary approach 500s with "input directory … does not exist". The
    // pack is downloaded+inflated to /tmp on cold start (fast on warm reuse).
    // The version in the URL MUST match the installed @sparticuz/chromium-min.
    const chromium = (await import('@sparticuz/chromium-min')).default;
    const packUrl =
      process.env.CHROMIUM_PACK_URL ||
      'https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar';
    // PDF rendering needs no WebGL — skip the swiftshader graphics stack.
    chromium.setGraphicsMode = false;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(packUrl),
      headless: true,
    });
  }

  const executablePath =
    process.env.LOCAL_CHROME_PATH ||
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  return puppeteer.launch({ executablePath, headless: true });
}
