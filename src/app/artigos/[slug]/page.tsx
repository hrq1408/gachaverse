import { notFound } from 'next/navigation';
import { AdBanner } from '@/components/ad-banner';
import { ArticleContents, ArticleHeader, ArticleReferences, GuideDetails, RelatedArticles } from '@/components/article';
import { articles, contentPath } from '@/content/editorial';
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
  const metadata = pageMetadata(article.titulo, article.descricao, contentPath(article));
  return {
    ...metadata,
    authors: [{ name: article.autor }],
    openGraph: {
      ...metadata.openGraph, type: 'article' as const,
      publishedTime: article.publicacao, modifiedTime: article.atualizacao,
      images: [{ url: article.imagem, alt: article.textoAlternativo }],
    },
    twitter: { ...metadata.twitter, images: [article.imagem] },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await resolveArticle(params);
  return <div className="shell interior">
    <article className="prose">
      <ArticleHeader article={article} />
      <ArticleContents article={article} />
      <GuideDetails article={article} />
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: article.html }} />
      <ArticleReferences article={article} />
    </article>
    <RelatedArticles article={article} />
    <AdBanner />
  </div>;
}

