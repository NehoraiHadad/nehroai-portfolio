import '../../globals.css';
import type { Metadata, Viewport } from 'next';
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

// 5.12: themeColor moved to the `viewport` export (not `metadata`) per Next 14+ docs.
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#050E22' },
    { media: '(prefers-color-scheme: light)', color: '#F0F4FF' },
  ],
};

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

  // SEO: JSON-LD Person structured data
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nehorai Hadad',
    jobTitle: 'AI Engineer',
    url: siteUrl,
    sameAs: [
      dictionary.ownerContact.githubUrl,
      dictionary.ownerContact.linkedinUrl,
    ],
    knowsAbout: [
      'AI Agents',
      'LangGraph',
      'AWS AgentCore',
      'Model Context Protocol',
      'RAG',
      'Next.js',
      'React',
      'TypeScript',
      'Python',
      'AWS Lambda',
      'Docker',
      'PostgreSQL',
    ],
  };

  return (
    <html lang={lang} dir={direction} className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <I18nProvider locale={lang} dictionary={dictionary}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
