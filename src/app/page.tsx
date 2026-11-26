import { ArticleCard } from '@/components/article';
import { articles } from '@/content/editorial';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Calculator, CalendarDays, ChartNoAxesColumnIncreasing, Gamepad2, Gift } from 'lucide-react';
import { AdBanner } from '@/components/ad-banner';
import { GameCard } from '@/components/catalog';
import { games } from '@/content/catalog';
import { redemptionCodes, redemptionSnapshot } from '@/content/redemption';
import { codeStatus, isRecent } from '@/lib/redemption-status';
import { CopyRedemptionCode } from '@/components/copy-redemption-code';
import { pageMetadata, site } from '@/lib/site';

export const metadata = { ...pageMetadata(site.name, site.description, '/'), title: { absolute: site.name } };

const codeDeadline = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });

const shortcuts = [
  { title: 'Códigos de resgate', href: '/conteudo/codigos/', icon: Gift },
  { title: 'Calendário de banners', href: '/conteudo/calendario/', icon: CalendarDays },
  { title: 'Calculadora de pity', href: '/ferramentas/calculadora-pity/', icon: Calculator },
  { title: 'Warp Tracker', href: '/ferramentas/warp-tracker/', icon: ChartNoAxesColumnIncreasing },
  { title: 'Guias e artigos', href: '/conteudo/artigos/', icon: BookOpen },
];

export default function Home() {
  const now = redemptionSnapshot;
  const banners = articles.filter(({ periodo }) => periodo && Date.parse(periodo.inicio) <= now && Date.parse(periodo.fim) > now);
  const codes = redemptionCodes
    .filter(entry => isRecent(entry, now) && ['no-prazo', 'sem-prazo'].includes(codeStatus(entry, now)))
    .sort((a, b) => (b.publishedOn ?? '').localeCompare(a.publishedOn ?? ''))
    .slice(0, 4);
  const featured = ['honkai-star-rail-cones-de-luz', 'honkai-star-rail-jades-estelares', 'onde-resgatar-codigos']
    .flatMap(slug => articles.filter(article => article.slug === slug));

  return <>
    <section className="portal-hero">
      <div className="shell portal-hero-inner">
        <div>
          <p className="eyebrow">Guias de jogos gacha</p>
          <h1>Guias, ferramentas e códigos dos seus <em>jogos favoritos.</em></h1>
          <p className="intro">Dicas, builds, códigos de resgate, banners, calculadoras e guias completos dos principais jogos gacha.</p>
          <div className="actions">
            <a className="button primary" href="#jogos"><Gamepad2 size={19} aria-hidden="true" /> Explorar jogos</a>
            <Link className="button secondary" href="/conteudo/codigos/"><Gift size={18} aria-hidden="true" /> Códigos de resgate</Link>
          </div>
        </div>
        <Image className="portal-hero-art" src="/images/hero-gachaverse.webp" alt="" width={900} height={793} preload />
      </div>
    </section>
    <div className="shell home-content">
      <nav className="home-shortcuts" aria-label="Atalhos rápidos">
        {shortcuts.map(({ title, href, icon: Icon }) => <Link className="shortcut" key={href} href={href}>
          <span className="shortcut-icon"><Icon size={22} aria-hidden="true" /></span>{title}<ArrowRight className="shortcut-arrow" size={16} aria-hidden="true" />
        </Link>)}
      </nav>
      {banners.length > 0 && <section>
        <div className="section-heading"><h2>Banners atuais</h2><Link href="/conteudo/calendario/">Ver calendário</Link></div>
        <div className="editorial-grid">{banners.map(article => <ArticleCard key={article.slug} article={article} />)}</div>
      </section>}
      <section>
        <div className="section-heading"><h2>Códigos de resgate recentes</h2><Link href="/conteudo/codigos/">Ver central de códigos</Link></div>
        {codes.length ? <ul className="card-grid">{codes.map(({ game, code, expiresAt, rewards }) =>
          <li className="section-card home-code" key={game + code}>
            <Link className="home-code-game" href={'/jogos/' + game + '/codigos/'}>{games.find(entry => entry.slug === game)?.name}</Link>
            <code>{code}</code>
            <p>{rewards.join(' · ')}</p>
            {expiresAt ? <p className="home-code-deadline">Prazo oficial até <time dateTime={expiresAt}>{codeDeadline.format(new Date(expiresAt))}</time> (Brasília)</p>
              : <p className="home-code-deadline">Prazo desconhecido</p>}
            <CopyRedemptionCode entry={{ game, code, expiresAt }} />
          </li>)}</ul> : <p>Consulte a central para conferir os códigos disponíveis por jogo.</p>}
      </section>
      <section id="jogos">
        <div className="section-heading"><h2>Jogos disponíveis</h2><Link href="/jogos/">Ver todos os jogos</Link></div>
        <div className="card-grid">{games.map(game => <GameCard key={game.slug} game={game} />)}</div>
      </section>
      <AdBanner placement="home" />
      {featured.length > 0 && <section>
        <div className="section-heading"><h2>Conteúdo em destaque</h2><Link href="/conteudo/artigos/">Ver todos os artigos</Link></div>
        <div className="editorial-grid">{featured.map(article => <ArticleCard key={article.slug} article={article} />)}</div>
      </section>}
      <section>
        <div className="section-heading"><h2>Últimos artigos</h2><Link href="/busca/">Buscar no acervo</Link></div>
        <div className="editorial-grid">{articles.filter(article => !featured.includes(article)).slice(0, 6).map(article => <ArticleCard key={article.slug} article={article} />)}</div>
      </section>
    </div>
  </>;
}
