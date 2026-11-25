import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdBanner } from '@/components/ad-banner';
import { PageHeading } from '@/components/catalog';
import { articles, contentPath } from '@/content/editorial';
import { games, sections, sectionPath } from '@/content/catalog';
import { pageMetadata } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => articles.map(({ slug }) => ({ slug }));

async function resolveArticle(params: Props['params']) {
  const { slug } = await params;
  const article = articles.find((entry) => entry.slug === slug);
  if (!article) notFound();
  return article;
}

export async function generateMetadata({ params }: Props) {
  const article = await resolveArticle(params);
  const metadata = pageMetadata(article.title, article.summary, contentPath(article));
  return { ...metadata, openGraph: { ...metadata.openGraph, type: 'article' as const } };
}

export default async function ArticlePage({ params }: Props) {
  const article = await resolveArticle(params);
  const category = sections.find((section) => section.slug === article.section);
  const game = games.find((entry) => entry.slug === article.game);
  return <div className="shell interior">
    <article className="prose">
      {category && <Link className="back-link" href={sectionPath(category, game)}>{category.title}</Link>}
      <PageHeading eyebrow={game?.name ?? 'GachaVerse'} title={article.title} description={article.summary} />
      {article.version && <p>Versão analisada: {article.version}</p>}
      {article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      <h2>Fontes oficiais</h2>
      <ul>{article.sources.map((source) => <li key={source.url}><a href={source.url}>{source.label}</a></li>)}</ul>
    </article>
    <AdBanner />
  </div>;
}

