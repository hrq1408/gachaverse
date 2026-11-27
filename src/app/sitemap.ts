import type { MetadataRoute } from 'next';
import { publicPaths } from '@/content/editorial';
import { site } from '@/lib/site';
import { articleAlternates } from '@/i18n/articles';
import { guideAlternates, homeAlternates, internationalSitemapPaths } from '@/i18n/seo';
import type { Alternates } from '@/i18n/locales';
import { legacyToolAlternates } from '@/i18n/tools';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = site.url;
  if (!origin) return [];
  function row(path: string, languages: Alternates = {}) {
    return {
      url: new URL(path, origin).href,
      ...((languages.en || languages.es) && { alternates: { languages: Object.fromEntries(
        Object.entries(languages).map(([locale, href]) => [locale, new URL(href, origin).href]),
      ) } }),
    };
  }
  return [
    ...publicPaths().map(path => row(path, path === '/' ? homeAlternates : path === '/conteudo/artigos/' ? guideAlternates()
      : path.startsWith('/artigos/') ? articleAlternates(path.split('/')[2]) : legacyToolAlternates(path))),
    ...internationalSitemapPaths().map(({ path, languages }) => row(path, languages)),
  ];
}
