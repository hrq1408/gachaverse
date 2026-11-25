import { ArticleCard } from '@/components/article';
import { articles, contentPath, publishedSections } from '@/content/editorial';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Gamepad2, Sparkles } from 'lucide-react';
import { AdBanner } from '@/components/ad-banner';
import { GameCard, SectionCard } from '@/components/catalog';
import { games } from '@/content/catalog';
import { pageMetadata, site } from '@/lib/site';

export const metadata = { ...pageMetadata(site.name, site.description, '/'), title: { absolute: site.name } };

export default function Home() {
  const lead = articles[0];
  return <>
    <section className="hero" style={lead ? { '--hero-image': `url("${lead.imagem}")` } as CSSProperties : undefined}>
      <div className="shell hero-inner">
        <p className="eyebrow"><Sparkles size={16} aria-hidden="true" /> Guias de jogos gacha</p>
        <h1>{lead?.titulo ?? 'Explore o GachaVerse'}</h1>
        <p className="intro">{lead?.descricao ?? site.description}</p>
        <div className="actions">
          {lead && <Link className="button primary" href={contentPath(lead)}>Ler guia</Link>}
          <a className="button secondary" href="#jogos"><Gamepad2 size={19} aria-hidden="true" /> Explorar jogos</a>
        </div>
      </div>
    </section>
    <div className="shell home-content">
      <section id="jogos">
        <div className="section-heading"><h2>Escolha seu jogo</h2><Link href="/jogos/">Ver todos os jogos</Link></div>
        <div className="card-grid">{games.map((game) => <GameCard key={game.slug} game={game} />)}</div>
      </section>
      <AdBanner placement="leaderboard" />
      <div className="editorial-layout">
        <section>
          <div className="section-heading"><h2>Guias recentes</h2><Link href="/busca/">Buscar no acervo</Link></div>
          <div className="editorial-grid">{articles.slice(0, 6).map((article) => <ArticleCard article={article} key={article.slug} />)}</div>
        </section>
        <section>
          <div className="section-heading"><h2>Categorias</h2></div>
          <div className="category-stack">{publishedSections().map((section) => <SectionCard key={section.slug} section={section} />)}</div>
        </section>
      </div>
    </div>
  </>;
}
