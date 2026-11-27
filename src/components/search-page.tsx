import { Suspense } from 'react';
import { ArticleCard } from './article';
import { ArticleSearch } from './article-search';
import { SectionPage } from './page-frames';
import { games } from '@/content/catalog';
import type { Locale } from '@/i18n/locales';
import { toolTitles } from '@/i18n/tools';
import { localizedArticles, localizedSection } from '@/i18n/visual-content';

const copy = {
  'pt-BR': { eyebrow: 'Acervo editorial', title: 'Busca de artigos', description: 'Encontre artigos publicados pelo GachaVerse.', loading: 'Carregando busca…' },
  en: { eyebrow: 'Editorial archive', title: toolTitles.en.search[0], description: toolTitles.en.search[1], loading: 'Loading search…' },
  es: { eyebrow: 'Archivo editorial', title: toolTitles.es.search[0], description: toolTitles.es.search[1], loading: 'Cargando búsqueda…' },
} as const;

export function SearchPage({ locale }: { locale: Locale }) {
  const { loading, ...heading } = copy[locale];
  const articles = localizedArticles(locale);
  const terms = articles.map(article => [
    article.titulo, article.descricao, localizedSection(article.categoria, locale).title,
    ...games.filter(game => article.jogos.includes(game.slug)).map(game => game.name),
  ].join(' '));
  return <SectionPage {...heading}>
    <Suspense fallback={<p>{loading}</p>}>
      <ArticleSearch terms={terms} locale={locale}>{articles.map(article => <ArticleCard key={article.slug} article={article} locale={locale} level={2} />)}</ArticleSearch>
    </Suspense>
  </SectionPage>;
}
