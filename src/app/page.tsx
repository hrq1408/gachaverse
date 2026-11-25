import { publishedSections } from '@/content/editorial';
import Link from 'next/link';
import { BookOpen, Gamepad2, Sparkles } from 'lucide-react';
import { AdBanner } from '@/components/ad-banner';
import { GameCard, SectionCard } from '@/components/catalog';
import { games } from '@/content/catalog';
import { articles, contentPath } from '@/content/editorial';
import { pageMetadata, site } from '@/lib/site';

export const metadata = { ...pageMetadata(site.name, site.description, '/'), title: { absolute: site.name } };

export default function Home() {
  return <>
    <section className="hero">
      <div className="shell hero-inner">
        <p className="eyebrow"><Sparkles size={16} aria-hidden="true" /> Portal brasileiro de jogos gacha</p>
        <h1>Seu universo<br /> <em>gacha em PT-BR.</em></h1>
        <p className="intro">Encontre guias e canais oficiais de resgate para Honkai: Star Rail, Genshin Impact, Zenless Zone Zero e Wuthering Waves.</p>
        <div className="actions">
          <a className="button primary" href="#jogos"><Gamepad2 size={19} aria-hidden="true" /> Explorar jogos</a>
          <Link className="button secondary" href="/conteudo/codigos/">Códigos de resgate</Link>
        </div>
      </div>
    </section>
    <div className="shell home-content">
      <section id="jogos">
        <div className="section-heading"><h2>Jogos em destaque</h2><Link href="/jogos/">Ver todos os jogos</Link></div>
        <div className="card-grid">{games.map((game) => <GameCard key={game.slug} game={game} />)}</div>
      </section>
      <AdBanner placement="leaderboard" />
      <section>
        <div className="section-heading"><h2>Explore o portal</h2></div>
        <div className="card-grid">{publishedSections().map((section) => <SectionCard key={section.slug} section={section} />)}</div>
      </section>
      <section>
        <div className="section-heading"><h2>Guias publicados</h2><Link href="/conteudo/artigos/">Ver artigos</Link></div>
        {articles.filter((article) => article.section === 'artigos').map((article) => <article className="panel featured" key={article.slug}>
          <span className="section-icon"><BookOpen size={22} aria-hidden="true" /></span>
          <div><h3><Link href={contentPath(article)}>{article.title}</Link></h3><p>{article.summary}</p></div>
        </article>)}
      </section>
    </div>
  </>;
}

