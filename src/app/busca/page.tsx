import { Suspense } from 'react';
import { ArticleCard } from '@/components/article';
import { ArticleSearch } from '@/components/article-search';
import { PageHeading } from '@/components/catalog';
import { articles } from '@/content/articles';
import { games, sections } from '@/content/catalog';
import { pageMetadata } from '@/lib/site';

const description = 'Encontre artigos publicados pelo GachaVerse.';
export const metadata = pageMetadata('Busca de artigos', description, '/busca/', false);

export default function SearchPage() {
  const terms = articles.map((article) => [
    article.titulo, article.descricao, sections.find((section) => section.slug === article.categoria)?.title,
    ...games.filter((game) => article.jogos.includes(game.slug)).map((game) => game.name),
  ].join(' '));
  return <div className="shell interior">
    <PageHeading eyebrow="Acervo editorial" title="Busca de artigos" description={description} />
    <Suspense fallback={<p>Carregando busca…</p>}>
      <ArticleSearch terms={terms}>{articles.map((article) => <ArticleCard key={article.slug} article={article} level={2} />)}</ArticleSearch>
    </Suspense>
  </div>;
}
