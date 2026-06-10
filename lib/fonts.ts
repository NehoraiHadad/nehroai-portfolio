import { Geist, Geist_Mono, Rubik } from 'next/font/google';

// Geist (Vercel, OFL) — sans + display. Variable font, full 100–900 weight axis,
// so we don't pin weights. Display uses the 800/900 end via CSS.
export const appSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

// Display reuses Geist (heavy weights) — kept as a separate export so the
// `--font-geist-display` variable / mapping stays explicit and swappable.
export const appDisplay = appSans;

// Geist Mono — labels, system lines, code, numeric data.
export const appMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
  fallback: ['SF Mono', 'Menlo', 'ui-monospace', 'monospace'],
});

// Rubik (OFL) — covers Hebrew + Latin in one family; the documented Hebrew
// display pair (Rubik Black). Variable font, so no weight pinning.
// preload:false — English pages don't need the Hebrew woff2 preloaded; the
// @font-face declaration is still emitted so /he works via CSS font-swap.
export const appHebrew = Rubik({
  subsets: ['hebrew', 'latin'],
  display: 'swap',
  preload: false,
  variable: '--font-rubik',
  fallback: ['Arial', 'system-ui', 'sans-serif'],
});

export const fontVariables = `${appSans.variable} ${appMono.variable} ${appHebrew.variable}`;
