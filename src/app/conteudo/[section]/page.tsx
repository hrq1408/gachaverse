import { notFound } from 'next/navigation';
import { PageHeading, SectionContent } from '@/components/catalog';
import { games, sections, sectionPath } from '@/content/catalog';
import { findArticles } from '@/content/editorial';
import { pageMetadata } from '@/lib/site';

type Props = { params: Promise<{ section: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => sections.map(({ slug }) => ({ section: slug }));

async function resolveSection(params: Props['params']) {
  const { section } = await params;
  const category = sections.find(({ slug }) => slug === section);
  if (!category) notFound();
  return category;
}

export async function generateMetadata({ params }: Props) {
  const category = await resolveSection(params);
  return pageMetadata(category.title, category.description, sectionPath(category),
    category.slug === 'codigos' || findArticles(category).length > 0);
}

export default async function ContentSection({ params }: Props) {
  const category = await resolveSection(params);
  return <div className="shell interior">
    <PageHeading eyebrow="GachaVerse" title={category.title} description={category.description} />
    <SectionContent section={category} games={games} />
  </div>;
}

