import { GameCard, PageHeading } from '@/components/catalog';
import { games } from '@/content/catalog';
import { pageMetadata } from '@/lib/site';

const description = 'Escolha um jogo para encontrar guias, builds, tier lists e canais de resgate.';
export const metadata = pageMetadata('Jogos', description, '/jogos/');

export default function GamesPage() {
  return <div className="shell interior">
    <PageHeading eyebrow="Catálogo" title="Jogos" description={description} />
    <h2 className="sr-only">Jogos cobertos pelo portal</h2>
    <div className="card-grid">{games.map((game) => <GameCard game={game} key={game.slug} />)}</div>
  </div>;
}

