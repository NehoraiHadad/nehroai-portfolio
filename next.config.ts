import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['instance-neo', '*.ts.net'],
  // Keep puppeteer-core and @sparticuz/chromium-min out of the server bundle —
  // they use native Node APIs that cannot be bundled. (chromium-min downloads
  // its Chromium pack from a URL at runtime, so there is no binary to trace.)
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
};

export default nextConfig;
