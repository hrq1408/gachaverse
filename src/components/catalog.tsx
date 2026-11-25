import { ArticleCard } from './article';
import { CodeValidity } from './code-validity';
import Link from 'next/link';
import { BookOpen, CalendarDays, Gamepad2, Gift, Layers3, Orbit, Sparkles, Swords, UserRound, Users, Waves, Zap } from 'lucide-react';
import { gamePath, sectionPath, type Game, type Section } from '@/content/catalog';
import { redemptionCodes, editorialSnapshotTime, findArticles } from '@/content/editorial';


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

function Redemption({ game }: { game: Game }) {
  const codes = redemptionCodes.filter((entry) => entry.game === game.slug);
  const steps = 'redemptionSteps' in game ? game.redemptionSteps : undefined;
  return <section className="panel">
    <h2>{game.name}</h2>
    <p>{steps ?? 'Acesse a página oficial e siga as instruções para vincular o código à sua conta.'}</p>
    <p><a data-game={game.slug} data-redemption="" href={game.redemption}>{steps ? 'Ver instruções da Kuro Games' : 'Abrir página oficial de resgate'}</a></p>
    {codes.length ? <ul className="code-list">{codes.map((entry) => <li key={entry.code}>
      <code>{entry.code}</code> · {entry.reward} · <a data-game={game.slug} data-redemption="" href={entry.source}>Fonte oficial</a>
      <small>Verificado em <time dateTime={entry.verifiedOn}>{entry.verifiedOn}</time></small>
      <CodeValidity expiresAt={entry.expiresAt} snapshot={editorialSnapshotTime} />
    </li>)}</ul> : <p className="muted">Ainda não há códigos verificados publicados aqui.</p>}
  </section>;
}

export function SectionContent({ section, games, game }: {
  section: Section; games: readonly Game[]; game?: Game;
}) {
  const entries = findArticles(section, game);
  return <div className="content-stack">
    {section.slug === 'codigos' ? (game ? [game] : games).map((item) => <Redemption key={item.slug} game={item} />) :
      entries.length ? entries.map((article) => <ArticleCard article={article} level={2} key={article.slug} />) : <div className="panel"><h2>Em preparação</h2><p>O primeiro conteúdo desta seção será publicado após revisão editorial.</p>
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

