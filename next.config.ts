import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['instance-neo', '*.ts.net'],
  // Keep puppeteer-core and @sparticuz/chromium out of the server bundle —
  // they use native Node APIs that cannot be Webpack-bundled.
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
};

export default nextConfig;
