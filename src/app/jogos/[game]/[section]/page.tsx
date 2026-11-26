import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeading, SectionContent } from '@/components/catalog';
import { games, gamePath, sections, sectionPath } from '@/content/catalog';
import { sectionHasContent } from '@/content/editorial';
import { pageMetadata } from '@/lib/site';

type Props = { params: Promise<{ game: string; section: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => games.flatMap((game) =>
  sections.map((section) => ({ game: game.slug, section: section.slug })),
);

async function resolvePage(params: Props['params']) {
  const { game, section } = await params;
  const entry = games.find(({ slug }) => slug === game);
  const category = sections.find(({ slug }) => slug === section);
  if (!entry || !category) notFound();
  return { entry, category };
}

export async function generateMetadata({ params }: Props) {
  const { entry, category } = await resolvePage(params);
  const description = category.slug === 'codigos'
    ? `Consulte códigos de ${entry.name}, recompensas, prazos e fontes. Veja como resgatar no canal oficial.`
    : category.description;
  return pageMetadata(`${category.title} de ${entry.name}`, description, sectionPath(category, entry),
    sectionHasContent(category, entry));
}

export default async function GameSection({ params }: Props) {
  const { entry, category } = await resolvePage(params);
  return <div className="shell interior">
    <Link href={gamePath(entry)} className="back-link">{entry.name}</Link>
    <PageHeading eyebrow={entry.name} title={category.title} description={category.description} />
    <SectionContent section={category} game={entry} />
  </div>;
}

