import type { Metadata } from 'next';
import { pageMetadata, site } from '@/lib/site';
import { articleAlternates, publishedTranslations, translationPath, type Translation } from './articles';
import { feedPath, guidesPath, homePath, languageAlternates, translatedLocales, type Alternates, type TranslationLocale } from './locales';
import { editorialMessages } from './messages';

export const homeAlternates = languageAlternates({ 'pt-BR': '/', en: '/en/', es: '/es/' });
export const guideAlternates = () => languageAlternates({
  'pt-BR': guidesPath('pt-BR'),
  ...Object.fromEntries(translatedLocales.filter(lang => publishedTranslations.some(entry => entry.locale === lang))
    .map(lang => [lang, guidesPath(lang)])),
});

export function withLanguages(metadata: Metadata, languages: Alternates): Metadata {
  return site.url && (languages.en || languages.es)
    ? { ...metadata, alternates: { ...metadata.alternates, languages } } : metadata;
}

export function localizedMetadata(locale: TranslationLocale, title: string, description: string, path: string,
  index: boolean, languages: Alternates = {}, translation?: Translation): Metadata {
  const base = withLanguages(pageMetadata(title, description, path, index), languages);
  const entry = translation?.article;
  return {
    ...base,
    ...(site.url && {
      alternates: {
        ...base.alternates, types: index ? { 'application/rss+xml': feedPath(locale) } : {},
      },
    }),
    openGraph: {
      title, description, siteName: site.name, ...(site.url && { url: path }),
      locale: locale === 'en' ? 'en_US' : 'es_ES',
      ...(entry ? { type: 'article' as const, publishedTime: entry.publicacao, modifiedTime: entry.atualizacao }
        : { type: 'website' as const }),
      ...(site.url && { images: [{ url: entry?.imagem ?? '/portal.webp', alt: entry?.textoAlternativo ?? editorialMessages[locale].coverAlt }] }),
    },
    twitter: { ...base.twitter, ...(entry && site.url && { images: [entry.imagem] }) },
  };
}

export function internationalSitemapPaths() {
  return [
    ...translatedLocales.map(locale => ({ path: homePath(locale), languages: homeAlternates })),
    ...translatedLocales.filter(locale => publishedTranslations.some(entry => entry.locale === locale))
      .map(locale => ({ path: guidesPath(locale), languages: guideAlternates() })),
    ...publishedTranslations.map(entry => ({ path: translationPath(entry), languages: articleAlternates(entry.editorialId) })),
  ];
}
