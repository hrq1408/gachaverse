import Link from 'next/link';
import { AdBanner } from '@/components/ad-banner';
import { AdSlot } from '@/features/advertising/components';
import { ArticleCard, ArticleContents, ArticleHeader, ArticleReferences, GuideDetails, RelatedArticles } from './article';
import { PageHeading, SectionCard } from './catalog';
import { publishedSections } from '@/content/editorial';
import type { Article } from '@/content/articles';
import { games, type Game } from '@/content/catalog';
import { articleGraph, jsonLd } from '@/lib/article-distribution';
import { site } from '@/lib/site';
import { guidesPath, homePath, type Locale } from '@/i18n/locales';
import { messages } from '@/i18n/messages';
import { gameHubPath, toolPath } from '@/i18n/tools';
import { gameDirectoryPath, localizedArticlePath, localizedArticles, localizedRelated, trackerGuidePath } from '@/i18n/visual-content';

const labels = {
  'pt-BR': { breadcrumb: 'Caminho da página', explore: 'Explore também', gameGuides: 'Ver guias do jogo', tools: 'Ferramentas e códigos', codes: 'Central de códigos', pity: 'Calculadora de pity', related: 'Guias relacionados', allGames: 'Todos os jogos', description: 'Consulte os canais oficiais e as instruções de resgate em português.', official: 'Site oficial do jogo', redeem: 'Códigos de resgate', available: 'Conteúdo disponível', guides: 'Guias de', author: 'Equipe editorial do GachaVerse', empty: 'Em preparação' },
  en: { breadcrumb: 'Breadcrumb', explore: 'Explore more', gameGuides: 'See game guides', tools: 'Tools and codes', codes: 'Redemption code center', pity: 'Pity calculator', related: 'Related guides', allGames: 'All games', description: 'Find official channels and redemption instructions in English.', official: 'Official game website', redeem: 'Redemption codes', available: 'Available content', guides: 'Guides for', author: 'GachaVerse editorial team', empty: 'In preparation' },
  es: { breadcrumb: 'Ruta de navegación', explore: 'Explora también', gameGuides: 'Ver guías del juego', tools: 'Herramientas y códigos', codes: 'Centro de códigos', pity: 'Calculadora de pity', related: 'Guías relacionadas', allGames: 'Todos los juegos', description: 'Consulta los canales oficiales y las instrucciones de canje en español.', official: 'Sitio oficial del juego', redeem: 'Códigos de canje', available: 'Contenido disponible', guides: 'Guías de', author: 'Equipo editorial de GachaVerse', empty: 'En preparación' },
} as const;

export function EditorialIndex({ locale, title, description, entries }: {
  locale: Locale; title: string; description: string; entries: { article: Article; href?: string; note?: string }[];
}) {
  return <div className="shell interior">
    <PageHeading eyebrow="GachaVerse" title={title} description={description} />
    <div className="content-stack">{entries.length ? entries.map(({ article, href, note }) => note
      ? <div key={article.slug}><ArticleCard article={article} locale={locale} href={href} level={2} /><p>{note}</p></div>
      : <ArticleCard key={article.slug} article={article} locale={locale} href={href} level={2} />)
      : <div className="panel"><h2>{labels[locale].empty}</h2></div>}</div>
  </div>;
}

export function EditorialGame({ game, locale }: { game: Game; locale: Locale }) {
  const c = labels[locale];
  const guides = localizedArticles(locale).filter(article => article.jogos.includes(game.slug));
  const codes = locale === 'pt-BR' ? gameHubPath(game.slug, locale) + 'codigos/' : toolPath('codes', locale) + game.slug + '/';
  return <div className="shell interior">
    <Link href={gameDirectoryPath(locale)} className="back-link">{c.allGames}</Link>
    <PageHeading eyebrow={game.studio} title={game.name} description={c.description} />
    <a className="button secondary official" href={game.official}>{c.official}</a>
    <Link className="button secondary official ml-2" href={codes}>{c.redeem}</Link>
    <h2 className="mb-4 text-xl font-bold">{c.available}</h2>
    <div className="card-grid">{publishedSections(game).map(section => <SectionCard key={section.slug} section={section} game={game} locale={locale} />)}</div>
    {guides.length > 0 && <>{locale === 'pt-BR' && <AdSlot placement="game" />}<section id="guias" className="mt-8">
      <h2 className="mb-4 text-xl font-bold">{c.guides} {game.name}</h2>
      <div className="editorial-grid">{guides.map(article => <ArticleCard key={article.slug} article={article} locale={locale} />)}</div>
    </section></>}
  </div>;
}

export function EditorialArticle({ article, locale, path, preview }: { article: Article; locale: Locale; path: string; preview?: string }) {
  const c = labels[locale];
  const game = games.find(entry => article.jogos.length === 1 && article.jogos.includes(entry.slug));
  const related = localizedRelated(article, locale);
  const crumbs = [
    { name: messages[locale].home, path: homePath(locale) },
    { name: messages[locale].guides, path: guidesPath(locale) },
    ...(game ? [{ name: game.name, path: gameHubPath(game.slug, locale) }] : []),
    { name: article.titulo, path },
  ];
  const author = article.autor === labels['pt-BR'].author ? c.author : article.autor;
  return <div className="shell interior">
    {site.url && !preview && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleGraph(article, crumbs, site.url, locale, author)) }} />}
    <nav className="article-breadcrumbs" aria-label={c.breadcrumb}>
      {crumbs.map(({ name, path }, index) => <span key={path} className="article-crumb">
        {index > 0 && <span aria-hidden="true">/</span>}
        {index === crumbs.length - 1 ? <span aria-current="page">{name}</span> : <Link href={path}>{name}</Link>}
      </span>)}
    </nav>
    <div className="article-columns"><article className="prose">
      {preview && <p className="panel">{preview}</p>}
      <ArticleHeader article={article} locale={locale} />
      <ArticleContents article={article} locale={locale} />
      <GuideDetails article={article} locale={locale} />
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: article.html }} />
      {locale === 'pt-BR' && <AdBanner placement="articleBody" />}
      <ArticleReferences article={article} locale={locale} />
    </article><aside className="article-sidebar" aria-label={c.explore}>
      {game && <section className="panel"><h2>{game.name}</h2><p><Link href={gameHubPath(game.slug, locale)}>{c.gameGuides}</Link></p></section>}
      <section className="panel"><h2>{c.tools}</h2>
        <ul><li><Link href={toolPath('codes', locale)}>{c.codes}</Link></li>
          <li><Link href={toolPath('pity', locale)}>{c.pity}</Link></li>
          <li><Link href={trackerGuidePath(locale)}>Warp Tracker</Link></li></ul>
      </section>
      <section className="panel article-sidebar-guides"><h2>{c.related}</h2>
        <ul>{related.map(entry => <li key={entry.slug}><Link href={localizedArticlePath(entry.slug, locale)}>{entry.titulo}</Link></li>)}</ul>
      </section>
      {locale === 'pt-BR' && <AdBanner placement="articleSidebar" />}
    </aside></div>
    <RelatedArticles article={article} locale={locale} />
  </div>;
}
