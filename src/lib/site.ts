import type { Metadata } from 'next';
import { legacyToolAlternates } from '@/i18n/tools';

export const site = {
  name: 'GachaVerse',
  description: 'Portal brasileiro de jogos gacha. Explore guias, builds, tier lists e canais oficiais de resgate.',
  url: process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : undefined,
};

export function pageMetadata(title: string, description: string, path: string, index = true): Metadata {
  const languages = index ? legacyToolAlternates(path) : {};
  return {
    title,
    description,
    ...(site.url ? { alternates: { canonical: path, types: { 'application/rss+xml': '/rss.xml' }, ...(languages.en && { languages }) } } : {}),
    openGraph: {
      title,
      description,
      siteName: site.name,
      type: 'website',
      locale: 'pt_BR',
      ...(site.url ? {
        url: path,
        images: [{ url: '/portal.webp', alt: 'Explorador diante de um portal roxo e ciano' }],
      } : {}),
    },
    twitter: {
      card: site.url ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(site.url ? { images: ['/portal.webp'] } : {}),
    },
    robots: { index: Boolean(site.url && index), follow: true },
  };
}
