import '../globals.css';
import type { Metadata, Viewport } from 'next';
import { getLocaleDirection } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { I18nProvider } from '@/lib/i18n/provider';
import { fontVariables } from '@/lib/fonts';
import { ThemeScript } from '@/app/components/ThemeScript';
import { adminLang } from './_components/lang';

// The admin app is private — keep it out of search indexes entirely.
export const metadata: Metadata = {
  title: 'Admin — Nehorai Hadad',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#050E22' },
    { media: '(prefers-color-scheme: light)', color: '#F0F4FF' },
  ],
};

// Admin locale is a private preference (cookie `admin_lang`), not a URL segment
// like the public site — the admin app is not SEO-indexed and shouldn't carry
// /en|/he in its paths. We still reuse the exact same dictionary + provider
// infrastructure, just sourced from the cookie. The language toggle flips this
// cookie and calls router.refresh().
export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await adminLang();
  const dictionary = await getDictionary(lang);
  const direction = getLocaleDirection(lang);

  return (
    <html lang={lang} dir={direction} className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <I18nProvider locale={lang} dictionary={dictionary}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
