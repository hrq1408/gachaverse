import { notFound } from 'next/navigation';
import { PageHeading, SectionContent } from '@/components/catalog';
import { sections, sectionPath } from '@/content/catalog';
import { sectionHasContent } from '@/content/editorial';
import { pageMetadata } from '@/lib/site';
import { guideAlternates, withLanguages } from '@/i18n/seo';

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
  const metadata = pageMetadata(category.title, category.description, sectionPath(category),
    sectionHasContent(category));
  return category.slug === 'artigos' ? withLanguages(metadata, guideAlternates()) : metadata;
}

export default async function ContentSection({ params }: Props) {
  const category = await resolveSection(params);
  return <div className="shell interior">
    <PageHeading eyebrow="GachaVerse" title={category.title} description={category.description} />
    <SectionContent section={category} />
  </div>;
}

