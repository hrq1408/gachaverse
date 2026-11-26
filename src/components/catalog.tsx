import { ArticleCard } from './article';
import { RedemptionCenter } from './redemption-center';
import Link from 'next/link';
import { BookOpen, CalendarDays, Gamepad2, Gift, Layers3, Orbit, Sparkles, Swords, UserRound, Users, Waves, Zap } from 'lucide-react';
import { gamePath, sectionPath, type Game, type Section } from '@/content/catalog';
import { findArticles } from '@/content/editorial';
import { redemptionCodes, redemptionSnapshot } from '@/content/redemption';


const gameIcons = { rail: Orbit, genshin: Sparkles, zenless: Zap, waves: Waves };
const sectionIcons = { artigos: BookOpen, builds: Swords, 'tier-lists': Layers3, codigos: Gift, calendario: CalendarDays, personagens: UserRound, equipes: Users };

export function GameCard({ game }: { game: Game }) {
  const Icon = gameIcons[game.theme];
  return <Link data-game={game.slug} href={gamePath(game)} className={`game-card theme-${game.theme}`}>
    <div className="game-art" aria-hidden="true">
      <span className="game-mark">{game.mark}</span><Icon className="game-icon" strokeWidth={1.1} />
    </div>
    <div className="game-info"><span>{game.studio}</span><h3>{game.name}</h3></div>
  </Link>;
}

export function SectionCard({ section, game }: { section: Section; game?: Game }) {
  const Icon = sectionIcons[section.slug];
  return <Link href={sectionPath(section, game)} className="section-card">
    <span className="section-icon"><Icon size={20} aria-hidden="true" /></span>
    <h3>{section.title}</h3><p>{section.description}</p>
  </Link>;
}

export function SectionContent({ section, game }: {
  section: Section; game?: Game;
}) {
  if (section.slug === 'codigos') {
    const codes = game ? redemptionCodes.filter(entry => entry.game === game.slug) : redemptionCodes;
    return <RedemptionCenter key={game?.slug ?? 'central'} entries={codes} game={game} snapshot={redemptionSnapshot} />;
  }
  const entries = findArticles(section, game);
  return <div className="content-stack">
    {entries.length ? entries.map((article) => <ArticleCard article={article} level={2} key={article.slug} />) : <div className="panel"><h2>Em preparação</h2><p>O primeiro conteúdo desta seção será publicado após revisão editorial.</p>
        <Link href={game ? gamePath(game) : '/jogos/'}>{game ? 'Voltar ao jogo' : 'Explorar jogos'}</Link>
      </div>}

  </div>;
}

export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="page-heading">
    <p className="eyebrow"><Gamepad2 size={16} aria-hidden="true" />{eyebrow}</p>
    <h1>{title}</h1><p className="intro">{description}</p>
  </div>;
}

