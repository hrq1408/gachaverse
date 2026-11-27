export const translatedLocales = ['en', 'es'] as const;
export type TranslationLocale = typeof translatedLocales[number];
export type Locale = 'pt-BR' | TranslationLocale;

export const localeLabels: Record<Locale, string> = { 'pt-BR': 'Português (Brasil)', en: 'English', es: 'Español' };
export const homePath = (locale: Locale) => locale === 'pt-BR' ? '/' : '/' + locale + '/';
export const guidesSegment = { en: 'guides', es: 'guias' } as const;
export const guidesPath = (locale: Locale) => locale === 'pt-BR' ? '/conteudo/artigos/' : homePath(locale) + guidesSegment[locale] + '/';
export const feedPath = (locale: Locale) => homePath(locale) + 'rss.xml';
export const isTranslationLocale = (lang: string): lang is TranslationLocale => lang === 'en' || lang === 'es';
export type Alternates = Partial<Record<Locale | 'x-default', string>>;

export function languageAlternates(paths: Partial<Record<Locale, string>>): Alternates {
  return { ...paths, ...(paths['pt-BR'] && { 'x-default': paths['pt-BR'] }) };
}
