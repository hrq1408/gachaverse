import { EditorialArticle } from '@/components/editorial-pages';
import { notFound } from 'next/navigation';
import { articles, contentPath } from '@/content/editorial';
import { pageMetadata } from '@/lib/site';
import { articleAlternates } from '@/i18n/articles';
import { articleSeoTitle, withLanguages } from '@/i18n/seo';

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
  const title = articleSeoTitle(article.slug, article.titulo, 'pt-BR');
  const metadata = withLanguages(pageMetadata(title, article.descricao, contentPath(article)), articleAlternates(article.slug));
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
  return <EditorialArticle article={article} locale="pt-BR" path={contentPath(article)} />;
}
