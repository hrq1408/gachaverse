import Link from 'next/link';
import Image from 'next/image';
import { games, sections } from '@/content/catalog';
import type { Article } from '@/content/articles';
import type { Locale } from '@/i18n/locales';
import { gameHubPath } from '@/i18n/tools';
import { localizedArticlePath, localizedRelated, localizedSection, localizedSectionPath } from '@/i18n/visual-content';

const labels = {
  'pt-BR': { by: 'Por', author: 'Equipe editorial do GachaVerse', read: 'min de leitura', updated: 'Atualizado em', version: 'Versão analisada:', period: 'Período', until: 'até', tocLabel: 'Índice do artigo', toc: 'Neste guia', sources: 'Fontes consultadas', focus: 'Personagem em foco', equipment: 'Equipamentos da build', team: 'Composição da equipe', related: 'Conteúdo relacionado', redeem: 'Resgate em' },
  en: { by: 'By', author: 'GachaVerse editorial team', read: 'min read', updated: 'Updated on', version: 'Version covered:', period: 'Period', until: 'to', tocLabel: 'Article contents', toc: 'In this guide', sources: 'Sources', focus: 'Featured character', equipment: 'Build equipment', team: 'Team composition', related: 'Related content', redeem: 'Redeem in' },
  es: { by: 'Por', author: 'Equipo editorial de GachaVerse', read: 'min de lectura', updated: 'Actualizado el', version: 'Versión analizada:', period: 'Período', until: 'hasta', tocLabel: 'Índice del artículo', toc: 'En esta guía', sources: 'Fuentes consultadas', focus: 'Personaje destacado', equipment: 'Equipamiento', team: 'Composición del equipo', related: 'Contenido relacionado', redeem: 'Canje en' },
} as const;

const captions: Record<string, { en: string; es: string }> = {
  'Ilustração editorial gerada por IA para o GachaVerse. A arte representa uma cena fictícia.': {
    en: 'AI-generated editorial illustration for GachaVerse. The artwork depicts a fictional scene.',
    es: 'Ilustración editorial generada con IA para GachaVerse. La imagen representa una escena ficticia.',
  },
  'Ilustração editorial gerada por IA para o GachaVerse. Os números e painéis são ilustrativos. Consulte os valores e prazos no jogo.': {
    en: 'AI-generated editorial illustration for GachaVerse. Figures and panels are illustrative. Check the game for actual values and deadlines.',
    es: 'Ilustración editorial generada con IA para GachaVerse. Las cifras y los paneles son ilustrativos. Comprueba los valores y los plazos en el juego.',
  },
  'Ilustração editorial original gerada por IA para o GachaVerse. A imagem é conceitual.': {
    en: 'Original AI-generated editorial illustration for GachaVerse. The image is conceptual.',
    es: 'Ilustración editorial original generada con IA para GachaVerse. La imagen es conceptual.',
  },
  'Ilustração geométrica original do GachaVerse.': {
    en: 'Original geometric illustration by GachaVerse.',
    es: 'Ilustración geométrica original de GachaVerse.',
  },
};

function ArticleDate({ value, locale }: { value: string; locale: Locale }) {
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' });
  return <time dateTime={value}>{formatter.format(new Date(value))}</time>;
}

function BannerPeriod({ article, locale }: { article: Article; locale: Locale }) {
  if (!article.periodo) return null;
  const format = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' });
  return <p>{labels[locale].period} (UTC) · <time dateTime={article.periodo.inicio}>{format.format(new Date(article.periodo.inicio))}</time> {labels[locale].until} <time dateTime={article.periodo.fim}>{format.format(new Date(article.periodo.fim))}</time></p>;
}

export function ArticleCard({ article, level = 3, locale = 'pt-BR', href }: { article: Article; level?: 2 | 3; locale?: Locale; href?: string }) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return <article className="editorial-card">
    <Image className="editorial-cover" src={article.imagem} alt="" width={640} height={360} />
    <div className="editorial-copy"><div className="editorial-meta">
      <span>{localizedSection(article.categoria, locale).title}</span>
      <ArticleDate value={article.publicacao} locale={locale} /></div>
    <Heading><Link href={href ?? localizedArticlePath(article.slug, locale)}>{article.titulo}</Link></Heading>
    <p>{article.descricao}</p>
    <BannerPeriod article={article} locale={locale} /></div>
  </article>;
}

export function ArticleHeader({ article, locale = 'pt-BR' }: { article: Article; locale?: Locale }) {
  const section = sections.find((entry) => entry.slug === article.categoria)!;
  const minutes = Math.max(1, Math.ceil(article.html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length / 200));
  const caption = article.legendaImagem && locale !== 'pt-BR' ? captions[article.legendaImagem]?.[locale] : undefined;
  return <header className="page-heading article-heading">
    <div className="article-labels"><Link href={localizedSectionPath(section, locale)}>{localizedSection(section.slug, locale).title}</Link>
      {games.filter(game => article.jogos.includes(game.slug)).map(game =>
        <Link key={game.slug} data-game={game.slug} href={gameHubPath(game.slug, locale)}>{game.name}</Link>)}</div>
    <h1>{article.titulo}</h1><p className="intro">{article.descricao}</p>
    <p className="article-byline">{labels[locale].by} {article.autor === labels['pt-BR'].author ? labels[locale].author : article.autor} · <ArticleDate value={article.publicacao} locale={locale} /> · {minutes} {labels[locale].read}</p>
    {article.atualizacao !== article.publicacao && <p>{labels[locale].updated} <ArticleDate value={article.atualizacao} locale={locale} /></p>}
    {article.versao && <p>{labels[locale].version} {article.versao}</p>}
    <BannerPeriod article={article} locale={locale} />
    <figure className="mt-5">
      <Image className="aspect-video w-full rounded-xl object-cover" src={article.imagem} alt={article.textoAlternativo} width={960} height={540} />
      {article.legendaImagem && <figcaption className="mt-2 text-sm" lang={caption ? locale : 'pt-BR'}>{caption ?? article.legendaImagem}</figcaption>}
    </figure>
  </header>;
}

export function ArticleContents({ article, locale = 'pt-BR' }: { article: Article; locale?: Locale }) {
  if (!article.headings.length) return null;
  return <nav className="panel article-toc" aria-label={labels[locale].tocLabel}>
    <h2>{labels[locale].toc}</h2><ol className="mt-3 list-decimal pl-5">
      {article.headings.map((heading) => <li key={heading.id} style={{ marginInlineStart: (heading.level - 2) + 'em' }}>
        <a href={'#' + heading.id}>{heading.title}</a>
      </li>)}
    </ol>
  </nav>;
}

export function ArticleReferences({ article, locale = 'pt-BR' }: { article: Article; locale?: Locale }) {
  return <section><h2 data-article-end="">{labels[locale].sources}</h2>
    <ul>{article.fontes.map((source) => <li key={source.url}><a href={source.url} lang="pt-BR">{source.titulo}</a></li>)}</ul>
  </section>;
}

export function GuideDetails({ article, locale = 'pt-BR' }: { article: Article; locale?: Locale }) {
  return <>
    {article.personagem && <p>{labels[locale].focus} · {article.personagem}</p>}
    {!!article.equipamentos?.length && <section><h2>{labels[locale].equipment}</h2><ul>
      {article.equipamentos.map((item) => <li key={item.nome}><strong>{item.nome}</strong> · {item.motivo}</li>)}
    </ul></section>}
    {!!article.equipe?.length && <section><h2>{labels[locale].team}</h2><ul>
      {article.equipe.map((item) => <li key={item.personagem}><strong>{item.personagem}</strong> · {item.funcao}</li>)}
    </ul></section>}
  </>;
}

export function RelatedArticles({ article, locale = 'pt-BR' }: { article: Article; locale?: Locale }) {
  const related = localizedRelated(article, locale);
  const redemption = sections.find((section) => section.slug === 'codigos')!;
  const redemptionGames = games.filter((game) =>
    article.jogos.includes(game.slug) && article.fontes.some((source) => source.url === game.redemption),
  );
  if (!related.length && !redemptionGames.length) return null;
  return <section className="mt-8"><h2 className="mb-4 text-xl font-bold">{labels[locale].related}</h2>
    <div className="editorial-grid related-grid">{related.map((item) => <ArticleCard article={item} key={item.slug} locale={locale} />)}</div>
    {redemptionGames.length > 0 && <ul className="grid gap-3 sm:grid-cols-2">
      {redemptionGames.map((game) => <li key={game.slug}><Link className="section-card block" href={localizedSectionPath(redemption, locale, game)}>
        {labels[locale].redeem} {game.name}
      </Link></li>)}
    </ul>}
  </section>;
}
