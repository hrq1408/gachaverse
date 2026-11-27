import { EditorialGame } from '@/components/editorial-pages';
import { notFound } from 'next/navigation';
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
  const entry = games.find(item => item.slug === game);
  if (!entry) notFound();
  return <EditorialGame game={entry} locale="pt-BR" />;
}
