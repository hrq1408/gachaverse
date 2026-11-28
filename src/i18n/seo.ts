import type { Metadata } from 'next';
import { pageMetadata, site } from '@/lib/site';
import { articleAlternates, publishedTranslations, translationPath, type Translation } from './articles';
import { feedPath, guidesPath, homePath, languageAlternates, translatedLocales, type Alternates, type TranslationLocale } from './locales';
import { editorialMessages } from './messages';
import { games } from '@/content/catalog';
import { hasNews } from '@/content/editorial';
import { codeGameAlternates, gameHubAlternates, gameHubPath, toolAlternates, toolPages, toolPath } from './tools';

export const homeAlternates = languageAlternates({ 'pt-BR': '/', en: '/en/', es: '/es/' });
export const localizedNewsAlternates = () => languageAlternates({
  ...(hasNews() && { 'pt-BR': toolPath('news', 'pt-BR') }),
  ...Object.fromEntries(translatedLocales
    .filter(locale => publishedTranslations.some(entry => entry.locale === locale && entry.article.noticia))
    .map(locale => [locale, toolPath('news', locale)])),
});
export const homeSeoTitles = {
  'pt-BR': 'GachaVerse — Guias, Códigos e Builds de Jogos Gacha',
  en: 'GachaVerse — Gacha Game Guides, Codes & Builds',
  es: 'GachaVerse — Guías, Códigos y Builds de Juegos Gacha',
};

export function articleSeoTitle(editorialId: string, title: string, locale: 'pt-BR' | TranslationLocale) {
  if (editorialId !== 'honkai-star-rail-reliquias') return title;
  return {
    'pt-BR': 'Relíquias em Honkai: Star Rail: atributos e síntese',
    en: 'Honkai: Star Rail Relics: Stats and Synthesis',
    es: 'Reliquias en Honkai: Star Rail: atributos y síntesis',
  }[locale];
}
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
    ...translatedLocales.flatMap(locale => toolPages.filter(page => page !== 'search' && page !== 'news')
      .map(page => ({ path: toolPath(page, locale), languages: toolAlternates(page) }))),
    ...translatedLocales.filter(locale => localizedNewsAlternates()[locale])
      .map(locale => ({ path: toolPath('news', locale), languages: localizedNewsAlternates() })),
    ...translatedLocales.flatMap(locale => games.map(game => ({
      path: toolPath('codes', locale) + game.slug + '/', languages: codeGameAlternates(game.slug),
    }))),
    ...translatedLocales.flatMap(locale => games.map(game => ({
      path: gameHubPath(game.slug, locale), languages: gameHubAlternates(game.slug),
    }))),
  ];
}
