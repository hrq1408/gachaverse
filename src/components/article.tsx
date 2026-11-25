import Link from 'next/link';
import Image from 'next/image';
import { games, sections, gamePath, sectionPath } from '@/content/catalog';
import { contentPath } from '@/content/editorial';
import { relatedArticles, type Article } from '@/content/articles';

const formatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' });

function ArticleDate({ value }: { value: string }) {
  return <time dateTime={value}>{formatter.format(new Date(value))}</time>;
}

export function ArticleCard({ article, level = 3 }: { article: Article; level?: 2 | 3 }) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return <article className="section-card">
    <Image className="mb-4 aspect-video w-full rounded-lg object-cover" src={article.imagem} alt="" width={640} height={360} />
    <span className="text-sm text-highlight"><ArticleDate value={article.publicacao} /></span>
    <Heading><Link href={contentPath(article)}>{article.titulo}</Link></Heading>
    <p>{article.descricao}</p>
  </article>;
}

export function ArticleHeader({ article }: { article: Article }) {
  const section = sections.find((entry) => entry.slug === article.categoria)!;
  return <header className="page-heading">
    <Link className="back-link" href={sectionPath(section)}>{section.title}</Link>
    <h1>{article.titulo}</h1><p className="intro">{article.descricao}</p>
    <p>Por {article.autor} · Publicado em <ArticleDate value={article.publicacao} /></p>
    <p>Atualizado em <ArticleDate value={article.atualizacao} /></p>
    <ul aria-label="Jogos abordados">{games.filter((game) => article.jogos.includes(game.slug)).map((game) =>
      <li key={game.slug}><Link href={gamePath(game)}>{game.name}</Link></li>)}</ul>
    {article.versao && <p>Versão analisada: {article.versao}</p>}
    <Image className="mt-5 aspect-video w-full rounded-xl object-cover" src={article.imagem} alt={article.textoAlternativo} width={960} height={540} />
  </header>;
}

export function ArticleContents({ article }: { article: Article }) {
  if (!article.headings.length) return null;
  return <nav className="panel block" aria-label="Índice do artigo">
    <h2>Neste guia</h2><ol className="mt-3 list-decimal pl-5">
      {article.headings.map((heading) => <li key={heading.id} style={{ marginInlineStart: (heading.level - 2) + 'em' }}>
        <a href={'#' + heading.id}>{heading.title}</a>
      </li>)}
    </ol>
  </nav>;
}

export function ArticleReferences({ article }: { article: Article }) {
  return <section><h2>Fontes consultadas</h2>
    <ul>{article.fontes.map((source) => <li key={source.url}><a href={source.url}>{source.titulo}</a></li>)}</ul>
  </section>;
}

export function RelatedArticles({ article }: { article: Article }) {
  const related = relatedArticles(article);
  if (!related.length) return null;
  return <section className="mt-8"><h2 className="mb-4 text-xl font-bold">Artigos relacionados</h2>
    <div className="card-grid">{related.map((item) => <ArticleCard article={item} key={item.slug} />)}</div>
  </section>;
}
