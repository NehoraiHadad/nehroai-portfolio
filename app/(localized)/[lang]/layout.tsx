import '../../globals.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocaleDirection, isLocale, locales } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { I18nProvider } from '@/lib/i18n/provider';
import { fontVariables } from '@/lib/fonts';

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = await getDictionary(lang);

  return {
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    alternates: {
      languages: {
        en: '/en',
        he: '/he',
      },
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = await getDictionary(lang);
  const direction = getLocaleDirection(lang);

  return (
    <html lang={lang} dir={direction} className={fontVariables} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <I18nProvider locale={lang} dictionary={dictionary}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
