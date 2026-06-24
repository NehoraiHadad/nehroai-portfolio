// Minimal root layout for the (pdf) route group. This group is URL-invisible
// and serves only headless-Chromium render pages — no nav, no admin shell, no
// theme toggle. CSS is shared with the rest of the app via globals.css so the
// quote-paper print styles apply without duplication.
import '../globals.css';
import type { Metadata } from 'next';
import { fontVariables } from '@/lib/fonts';

// PDF render pages are never meant to be indexed or followed by crawlers.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PdfRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
