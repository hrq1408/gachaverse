import { publishedTranslations, translationPath } from '@/i18n/articles';
import { editorialMessages } from '@/i18n/messages';
import { feedPath, homePath, isTranslationLocale, translatedLocales } from '@/i18n/locales';
import { articleFeed } from '@/lib/article-distribution';
import { site } from '@/lib/site';

export const dynamic = 'force-static';
export const dynamicParams = false;
export const generateStaticParams = () => translatedLocales.map(lang => ({ lang }));

export async function GET(_: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!site.url || !isTranslationLocale(lang)) return new Response(null, { status: 404 });
  const entries = publishedTranslations.filter(row => row.locale === lang);
  return new Response(articleFeed(entries.map(row => row.article), site.url, editorialMessages[lang].description, {
    home: homePath(lang), feed: feedPath(lang), locale: lang, articlePath: article => translationPath({ locale: lang, slug: article.slug }),
  }), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
