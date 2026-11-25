import { publishedSections } from '@/content/editorial';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeading, SectionCard } from '@/components/catalog';
import { games, gamePath } from '@/content/catalog';
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
    <PageHeading eyebrow={entry.studio} title={entry.name} description="Consulte os canais oficiais e as instruções de resgate em português." />
    <a className="button secondary official" href={entry.official}>Site oficial do jogo</a>
    <h2 className="mb-4 text-xl font-bold">Conteúdo disponível</h2>
    <div className="card-grid">{publishedSections(entry).map((section) => <SectionCard section={section} game={entry} key={section.slug} />)}</div>
  </div>;
}

