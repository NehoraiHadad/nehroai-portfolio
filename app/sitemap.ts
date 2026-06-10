import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
      alternates: {
        languages: {
          en: `${siteUrl}/en`,
          he: `${siteUrl}/he`,
        },
      },
    },
    {
      url: `${siteUrl}/en`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: {
        languages: {
          he: `${siteUrl}/he`,
        },
      },
    },
    {
      url: `${siteUrl}/he`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${siteUrl}/en`,
        },
      },
    },
  ];
}
