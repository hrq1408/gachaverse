import { PortalHome } from '@/components/portal-home';
import { notFound } from 'next/navigation';
import { editorialMessages } from '@/i18n/messages';
import { homeAlternates, homeSeoTitles, localizedMetadata } from '@/i18n/seo';
import { homePath, isTranslationLocale } from '@/i18n/locales';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  if (!isTranslationLocale(lang)) notFound();
  const copy = editorialMessages[lang];
  const title = homeSeoTitles[lang];
  return { ...localizedMetadata(lang, title, copy.description, homePath(lang), true, homeAlternates), title: { absolute: title } };
}

export default async function LocalizedHome({ params }: Props) {
  const { lang } = await params;
  if (!isTranslationLocale(lang)) notFound();
  return <PortalHome locale={lang} />;
}
