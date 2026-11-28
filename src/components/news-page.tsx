import { EditorialIndex } from './editorial-pages';
import { newsLabels } from '@/i18n/news';
import type { Locale } from '@/i18n/locales';
import { localizedArticles, localizedArticlePath } from '@/i18n/visual-content';

export function NewsPage({ locale }: { locale: Locale }) {
  const [title, description] = newsLabels[locale];
  const entries = localizedArticles(locale).filter(article => article.noticia)
    .map(article => ({ article, href: localizedArticlePath(article.slug, locale) }));
  return <EditorialIndex locale={locale} title={title} description={description} entries={entries} />;
}
