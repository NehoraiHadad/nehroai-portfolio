import '../../globals.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocaleDirection, isLocale, locales } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { I18nProvider } from '@/lib/i18n/provider';
import { fontVariables } from '@/lib/fonts';
import { ThemeScript } from '@/app/components/ThemeScript';
import { getAbsoluteUrl, siteOwnerName, siteUrl } from '@/lib/site-metadata';

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
  const pathname = `/${lang}`;

  return {
    metadataBase: new URL(siteUrl),
    applicationName: siteOwnerName,
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    alternates: {
      canonical: pathname,
      languages: {
        en: '/en',
        he: '/he',
        'x-default': '/en',
      },
    },
    openGraph: {
      type: 'website',
      siteName: siteOwnerName,
      url: getAbsoluteUrl(pathname),
      title: dictionary.meta.title,
      description: dictionary.meta.description,
      locale: lang === 'he' ? 'he_IL' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: dictionary.meta.title,
      description: dictionary.meta.description,
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
