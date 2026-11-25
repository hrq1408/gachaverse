import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeading, SectionCard } from '@/components/catalog';
import { games, gamePath, sections } from '@/content/catalog';
import { pageMetadata } from '@/lib/site';

type Props = { params: Promise<{ game: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => games.map(({ slug }) => ({ game: slug }));

export async function generateMetadata({ params }: Props) {
  const { game } = await params;
  const entry = games.find(({ slug }) => slug === game);
  if (!entry) notFound();
  return pageMetadata(entry.name, `Hub brasileiro de ${entry.name} com guias e resgate.`, gamePath(entry));
}

export default async function GamePage({ params }: Props) {
  const { game } = await params;
  const entry = games.find(({ slug }) => slug === game);
  if (!entry) notFound();
  return <div className="shell interior">
    <Link href="/jogos/" className="back-link">Todos os jogos</Link>
    <PageHeading eyebrow={entry.studio} title={entry.name} description="Artigos, builds, tier lists e instruções de resgate em português." />
    <a className="button secondary official" href={entry.official}>Site oficial do jogo</a>
    <div className="card-grid">{sections.map((section) => <SectionCard section={section} game={entry} key={section.slug} />)}</div>
  </div>;
}

