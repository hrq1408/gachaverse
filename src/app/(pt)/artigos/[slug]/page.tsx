import { notFound } from 'next/navigation';
import { AdBanner } from '@/components/ad-banner';
import { ArticleContents, ArticleHeader, ArticleReferences, GuideDetails, RelatedArticles } from '@/components/article';
import { articles, contentPath } from '@/content/editorial';
import { pageMetadata } from '@/lib/site';
import { relatedArticles } from '@/content/articles';
import { games, gamePath } from '@/content/catalog';
import Link from 'next/link';
import { articleGraph, jsonLd } from '@/lib/article-distribution';
import { site } from '@/lib/site';
import { articleAlternates } from '@/i18n/articles';
import { withLanguages } from '@/i18n/seo';

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
  const metadata = withLanguages(pageMetadata(article.titulo, article.descricao, contentPath(article)), articleAlternates(article.slug));
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
  const game = games.find(entry => article.jogos.length === 1 && article.jogos.includes(entry.slug));
  const crumbs = [
    { name: 'Início', path: '/' },
    { name: 'Guias', path: '/conteudo/artigos/' },
    ...(game ? [{ name: game.name, path: gamePath(game) }] : []),
    { name: article.titulo, path: contentPath(article) },
  ];
  return <div className="shell interior">
    {site.url && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleGraph(article, crumbs, site.url)) }} />}
    <nav className="article-breadcrumbs" aria-label="Caminho da página">
      {crumbs.map(({ name, path }, index) => <span key={path} className="article-crumb">
        {index > 0 && <span aria-hidden="true">/</span>}
        {index === crumbs.length - 1 ? <span aria-current="page">{name}</span> : <Link href={path}>{name}</Link>}
      </span>)}
    </nav>
    <div className="article-columns"><article className="prose">
      <ArticleHeader article={article} />
      <ArticleContents article={article} />
      <GuideDetails article={article} />
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: article.html }} />
      <AdBanner placement="articleBody" />
      <ArticleReferences article={article} />
    </article><aside className="article-sidebar" aria-label="Explore também">
      {game && <section className="panel"><h2>{game.name}</h2><p><Link href={gamePath(game)}>Ver guias do jogo</Link></p></section>}
      <section className="panel"><h2>Ferramentas e códigos</h2>
        <ul><li><Link href="/conteudo/codigos/">Central de códigos</Link></li>
          <li><Link href="/ferramentas/calculadora-pity/">Calculadora de pity</Link></li>
          <li><Link href="/ferramentas/warp-tracker/">Warp Tracker</Link></li></ul>
      </section>
      <section className="panel article-sidebar-guides"><h2>Guias relacionados</h2>
        <ul>{relatedArticles(article).slice(0, 3).map(entry => <li key={entry.slug}><Link href={contentPath(entry)}>{entry.titulo}</Link></li>)}</ul>
      </section>
      <AdBanner placement="articleSidebar" />
    </aside></div>
    <RelatedArticles article={article} />

  </div>;
}

