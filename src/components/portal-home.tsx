import { ArticleCard } from '@/components/article';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Calculator, CalendarDays, ChartNoAxesColumnIncreasing, Gamepad2, Gift } from 'lucide-react';
import { AdBanner } from '@/components/ad-banner';
import { GameCard } from '@/components/catalog';
import { games } from '@/content/catalog';
import { redemptionCodes, redemptionSnapshot } from '@/content/redemption';
import { codeStatus, isRecent } from '@/lib/redemption-status';
import { CopyRedemptionCode } from '@/components/copy-redemption-code';
import { BannerCalendar } from '@/components/banner-calendar';
import { banners } from '@/content/banners';
import { PartnerOffers } from '@/features/partners/partner-offers';
import { guidesPath, type Locale } from '@/i18n/locales';
import { gameDirectoryPath, localizedArticles, localizedArticlePath, trackerGuidePath } from '@/i18n/visual-content';
import { toolPath } from '@/i18n/tools';
import { localizedReward } from '@/i18n/catalog-copy';

const homeCopy = {
  "pt-BR": {
    "eyebrow": "Guias de jogos gacha",
    "title": "Guias, ferramentas e códigos dos seus",
    "accent": "jogos favoritos.",
    "intro": "Dicas, builds, códigos de resgate, banners, calculadoras e guias completos dos principais jogos gacha.",
    "explore": "Explorar jogos",
    "codes": "Códigos de resgate",
    "calendar": "Calendário de banners",
    "pity": "Calculadora de pity",
    "guides": "Guias e artigos",
    "quick": "Atalhos rápidos",
    "recent": "Códigos de resgate recentes",
    "central": "Ver central de códigos",
    "deadline": "Prazo oficial até",
    "unknown": "Prazo desconhecido",
    "empty": "Consulte a central para conferir os códigos disponíveis por jogo.",
    "games": "Jogos disponíveis",
    "allGames": "Ver todos os jogos",
    "featured": "Conteúdo em destaque",
    "allGuides": "Ver todos os artigos",
    "latest": "Últimos artigos",
    "search": "Buscar no acervo"
  },
  "en": {
    "eyebrow": "Gacha game guides",
    "title": "Guides, tools, and codes for your",
    "accent": "favorite games.",
    "intro": "Tips, builds, redemption codes, banners, calculators, and in-depth guides for the major gacha games.",
    "explore": "Explore games",
    "codes": "Redemption codes",
    "calendar": "Banner calendar",
    "pity": "Pity calculator",
    "guides": "Guides and articles",
    "quick": "Quick links",
    "recent": "Recent redemption codes",
    "central": "View code center",
    "deadline": "Official deadline",
    "unknown": "Deadline unknown",
    "empty": "Visit the code center to check which codes are available for each game.",
    "games": "Featured games",
    "allGames": "View all games",
    "featured": "Featured content",
    "allGuides": "View all articles",
    "latest": "Latest articles",
    "search": "Search the guides"
  },
  "es": {
    "eyebrow": "Guías de juegos gacha",
    "title": "Guías, herramientas y códigos de tus",
    "accent": "juegos favoritos.",
    "intro": "Consejos, configuraciones, códigos de canje, banners, calculadoras y guías completas de los principales juegos gacha.",
    "explore": "Explorar juegos",
    "codes": "Códigos de canje",
    "calendar": "Calendario de banners",
    "pity": "Calculadora de pity",
    "guides": "Guías y artículos",
    "quick": "Accesos rápidos",
    "recent": "Códigos de canje recientes",
    "central": "Ver centro de códigos",
    "deadline": "Plazo oficial hasta",
    "unknown": "Plazo desconocido",
    "empty": "Consulta el centro de códigos para ver los códigos disponibles de cada juego.",
    "games": "Juegos disponibles",
    "allGames": "Ver todos los juegos",
    "featured": "Contenido destacado",
    "allGuides": "Ver todos los artículos",
    "latest": "Últimos artículos",
    "search": "Buscar en las guías"
  }
} as const;

export function PortalHome({ locale }: { locale: Locale }) {
  const c = homeCopy[locale];
  const entries = localizedArticles(locale);
  const codesHref = toolPath('codes', locale);
  const guidesHref = guidesPath(locale);
  const codeDeadline = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });
  const shortcuts = [
    { title: c.codes, href: codesHref, icon: Gift },
    { title: c.calendar, href: toolPath('calendar', locale), icon: CalendarDays },
    { title: c.pity, href: toolPath('pity', locale), icon: Calculator },
    { title: 'Warp Tracker', href: trackerGuidePath(locale), icon: ChartNoAxesColumnIncreasing },
    { title: c.guides, href: guidesHref, icon: BookOpen },
  ];
  const now = redemptionSnapshot;
  const codes = redemptionCodes
    .filter(entry => isRecent(entry, now) && ['no-prazo', 'sem-prazo'].includes(codeStatus(entry, now)))
    .sort((a, b) => (b.publishedOn ?? '').localeCompare(a.publishedOn ?? ''))
    .slice(0, 4);
  const featured = ['honkai-star-rail-cones-de-luz', 'honkai-star-rail-jades-estelares', 'onde-resgatar-codigos']
    .flatMap(slug => entries.filter(article => localizedArticlePath(article.slug, locale) === localizedArticlePath(slug, locale)));

  return <>
    <section className="portal-hero">
      <div className="shell portal-hero-inner">
        <div>
          <p className="eyebrow">{c.eyebrow}</p>
          <h1>{c.title} <em>{c.accent}</em></h1>
          <p className="intro">{c.intro}</p>
          <div className="actions">
            <a className="button primary" href="#jogos"><Gamepad2 size={19} aria-hidden="true" /> {c.explore}</a>
            <Link className="button secondary" href={codesHref}><Gift size={18} aria-hidden="true" /> {c.codes}</Link>
          </div>
        </div>
        <Image className="portal-hero-art" src="/images/hero-gachaverse.webp" alt="" width={900} height={793} preload />
      </div>
    </section>
    <div className="shell home-content">
      <nav id="atalhos" className="home-shortcuts" aria-label={c.quick}>
        {shortcuts.map(({ title, href, icon: Icon }) => <Link className="shortcut" key={href} href={href}>
          <span className="shortcut-icon"><Icon size={22} aria-hidden="true" /></span>{title}<ArrowRight className="shortcut-arrow" size={16} aria-hidden="true" />
        </Link>)}
      </nav>
      <BannerCalendar entries={banners} snapshot={now} locale={locale} home />
      <section>
        <div className="section-heading"><h2>{c.recent}</h2><Link href={codesHref}>{c.central}</Link></div>
        {codes.length ? <ul className="card-grid">{codes.map(({ game, code, expiresAt, rewards }) =>
          <li className="section-card home-code" key={game + code}>
            <Link className="home-code-game" href={locale === 'pt-BR' ? '/jogos/' + game + '/codigos/' : codesHref + game + '/'}>{games.find(entry => entry.slug === game)?.name}</Link>
            <code>{code}</code>
            <p>{rewards.map(reward => localizedReward(reward, locale).text).join(' · ')}</p>
            {expiresAt ? <p className="home-code-deadline">{c.deadline} <time dateTime={expiresAt}>{codeDeadline.format(new Date(expiresAt))}</time> (Brasília)</p>
              : <p className="home-code-deadline">{c.unknown}</p>}
            <CopyRedemptionCode entry={{ game, code, expiresAt }} locale={locale} />
          </li>)}</ul> : <p>{c.empty}</p>}
      </section>
      <section id="jogos">
        <div className="section-heading"><h2>{c.games}</h2><Link href={gameDirectoryPath(locale)}>{c.allGames}</Link></div>
        <div className="card-grid">{games.map(game => <GameCard key={game.slug} game={game} locale={locale} />)}</div>
      </section>
      {locale === 'pt-BR' && <><AdBanner placement="home" /><PartnerOffers /></>}
      {featured.length > 0 && <section>
        <div className="section-heading"><h2>{c.featured}</h2><Link href={guidesHref}>{c.allGuides}</Link></div>
        <div className="editorial-grid">{featured.map(article => <ArticleCard key={article.slug} article={article} locale={locale} />)}</div>
      </section>}
      <section>
        <div className="section-heading"><h2>{c.latest}</h2><Link href={toolPath('search', locale)}>{c.search}</Link></div>
        <div className="editorial-grid">{entries.filter(article => !featured.includes(article)).slice(0, 6).map(article => <ArticleCard key={article.slug} article={article} locale={locale} />)}</div>
      </section>
    </div>
  </>;
}
