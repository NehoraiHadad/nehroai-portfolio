// Root layout for the (public-quote) route group. This group is URL-invisible
// and serves the public client-facing approval page at /q/<token> — no admin
// shell, no nav, no session required. CSS is shared with the rest of the app
// via globals.css so design tokens (colors, fonts, button classes) apply without
// duplication. The page is intentionally noindex'd: the link is a private
// capability URL shared point-to-point with the quote recipient.
import '../globals.css';
import type { Metadata } from 'next';
import { fontVariables } from '@/lib/fonts';

// Public approval links are private capability URLs — never index or follow.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PublicQuoteRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      {/* Plain body — the page carries its own centered container and
          the dark surface comes from globals.css body { background: var(--color-page) } */}
      <body>{children}</body>
    </html>
  );
}
