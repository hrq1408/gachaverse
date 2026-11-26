import Link from 'next/link';
import Image from 'next/image';
import { games, sections, gamePath, sectionPath } from '@/content/catalog';
import { contentPath } from '@/content/editorial';
import { relatedArticles, type Article } from '@/content/articles';

const formatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' });

function ArticleDate({ value }: { value: string }) {
  return <time dateTime={value}>{formatter.format(new Date(value))}</time>;
}

function BannerPeriod({ article }: { article: Article }) {
  if (!article.periodo) return null;
  const format = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' });
  return <p>Período (UTC) · <time dateTime={article.periodo.inicio}>{format.format(new Date(article.periodo.inicio))}</time> até <time dateTime={article.periodo.fim}>{format.format(new Date(article.periodo.fim))}</time></p>;
}

export function ArticleCard({ article, level = 3 }: { article: Article; level?: 2 | 3 }) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return <article className="editorial-card">
    <Image className="editorial-cover" src={article.imagem} alt="" width={640} height={360} />
    <div className="editorial-copy"><div className="editorial-meta">
      <span>{sections.find((section) => section.slug === article.categoria)?.title}</span>
      <ArticleDate value={article.publicacao} /></div>
    <Heading><Link href={contentPath(article)}>{article.titulo}</Link></Heading>
    <p>{article.descricao}</p>
    <BannerPeriod article={article} /></div>
  </article>;
}

export function ArticleHeader({ article }: { article: Article }) {
  const section = sections.find((entry) => entry.slug === article.categoria)!;
  const minutes = Math.max(1, Math.ceil(article.html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length / 200));
  return <header className="page-heading article-heading">
    <div className="article-labels"><Link href={sectionPath(section)}>{section.title}</Link>
      {games.filter(game => article.jogos.includes(game.slug)).map(game =>
        <Link key={game.slug} data-game={game.slug} href={gamePath(game)}>{game.name}</Link>)}</div>
    <h1>{article.titulo}</h1><p className="intro">{article.descricao}</p>
    <p className="article-byline">Por {article.autor} · <ArticleDate value={article.publicacao} /> · {minutes} min de leitura</p>
    {article.atualizacao !== article.publicacao && <p>Atualizado em <ArticleDate value={article.atualizacao} /></p>}
    {article.versao && <p>Versão analisada: {article.versao}</p>}
    <BannerPeriod article={article} />
    <figure className="mt-5">
      <Image className="aspect-video w-full rounded-xl object-cover" src={article.imagem} alt={article.textoAlternativo} width={960} height={540} />
      {article.legendaImagem && <figcaption className="mt-2 text-sm">{article.legendaImagem}</figcaption>}
    </figure>
  </header>;
}

export function ArticleContents({ article }: { article: Article }) {
  if (!article.headings.length) return null;
  return <nav className="panel article-toc" aria-label="Índice do artigo">
    <h2>Neste guia</h2><ol className="mt-3 list-decimal pl-5">
      {article.headings.map((heading) => <li key={heading.id} style={{ marginInlineStart: (heading.level - 2) + 'em' }}>
        <a href={'#' + heading.id}>{heading.title}</a>
      </li>)}
    </ol>
  </nav>;
}

export function ArticleReferences({ article }: { article: Article }) {
  return <section><h2 data-article-end="">Fontes consultadas</h2>
    <ul>{article.fontes.map((source) => <li key={source.url}><a href={source.url}>{source.titulo}</a></li>)}</ul>
  </section>;
}

export function GuideDetails({ article }: { article: Article }) {
  return <>
    {article.personagem && <p>Personagem em foco · {article.personagem}</p>}
    {!!article.equipamentos?.length && <section><h2>Equipamentos da build</h2><ul>
      {article.equipamentos.map((item) => <li key={item.nome}><strong>{item.nome}</strong> · {item.motivo}</li>)}
    </ul></section>}
    {!!article.equipe?.length && <section><h2>Composição da equipe</h2><ul>
      {article.equipe.map((item) => <li key={item.personagem}><strong>{item.personagem}</strong> · {item.funcao}</li>)}
    </ul></section>}
  </>;
}

export function RelatedArticles({ article }: { article: Article }) {
  const related = relatedArticles(article);
  const redemption = sections.find((section) => section.slug === 'codigos')!;
  const redemptionGames = games.filter((game) =>
    article.jogos.includes(game.slug) && article.fontes.some((source) => source.url === game.redemption),
  );
  if (!related.length && !redemptionGames.length) return null;
  return <section className="mt-8"><h2 className="mb-4 text-xl font-bold">Conteúdo relacionado</h2>
    <div className="editorial-grid related-grid">{related.map((item) => <ArticleCard article={item} key={item.slug} />)}</div>
    {redemptionGames.length > 0 && <ul className="grid gap-3 sm:grid-cols-2">
      {redemptionGames.map((game) => <li key={game.slug}><Link className="section-card block" href={sectionPath(redemption, game)}>
        Resgate em {game.name}
      </Link></li>)}
    </ul>}
  </section>;
}
