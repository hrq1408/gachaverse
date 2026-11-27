import { articles } from '@/content/editorial';
import { relatedArticles, type Article } from '@/content/articles';
import { sections, sectionPath, type Game, type Section } from '@/content/catalog';
import { publishedTranslations, translationPath } from './articles';
import { guidesPath, homePath, type Locale } from './locales';
import { gameHubPath, toolPath } from './tools';

export function localizedArticles(locale: Locale) {
  if (locale === 'pt-BR') return articles;
  const translated = new Map(publishedTranslations.filter(entry => entry.locale === locale)
    .map(entry => [entry.editorialId, entry.article]));
  return articles.flatMap(article => translated.get(article.slug) ?? []);
}

export function localizedArticlePath(slug: string, locale: Locale) {
  const entry = publishedTranslations.find(row => row.locale === locale && (row.slug === slug || row.editorialId === slug));
  return entry ? translationPath(entry) : `/artigos/${slug}/`;
}

export function localizedRelated(article: Article, locale: Locale) {
  if (locale === 'pt-BR') return relatedArticles(article);
  const original = publishedTranslations.find(entry => entry.locale === locale && entry.slug === article.slug)?.source;
  if (!original) return relatedArticles(article, localizedArticles(locale));
  return relatedArticles(original).flatMap(item =>
    publishedTranslations.find(entry => entry.locale === locale && entry.editorialId === item.slug)?.article ?? []);
}

export const gameDirectoryPath = (locale: Locale) => locale === 'pt-BR' ? '/jogos/' : homePath(locale) + '#jogos';
export const toolsDirectoryPath = (locale: Locale) => locale === 'pt-BR' ? '/ferramentas/' : homePath(locale) + '#atalhos';
export const trackerGuidePath = (locale: Locale) => locale === 'pt-BR' ? '/ferramentas/warp-tracker/' : 'https://gachaverse-tracker.pages.dev/?lang=' + locale;

export function localizedSectionPath(section: Section, locale: Locale, game?: Game) {
  if (locale === 'pt-BR') return sectionPath(section, game);
  if (section.slug === 'codigos') return toolPath('codes', locale) + (game ? game.slug + '/' : '');
  if (section.slug === 'calendario') return toolPath('calendar', locale) + (game ? '#' + game.slug : '');
  if (section.slug === 'artigos') return game ? gameHubPath(game.slug, locale) + '#guias' : guidesPath(locale);
  return sectionPath(section, game);
}

const categoryCopy = {
  en: {
    calendario: ['Banner calendar', 'Banner windows confirmed by publishers.'],
    personagens: ['Characters', 'Character profiles and guides by game.'],
    equipes: ['Team compositions', 'Team roles, combinations, and synergies by version.'],
    artigos: ['Articles', 'Guides and editorial coverage.'],
    builds: ['Builds', 'Equipment, teams, and upgrade priorities.'],
    'tier-lists': ['Tier lists', 'Character rankings by version, role, and mode.'],
    codigos: ['Redemption codes', 'Check rewards and deadlines, copy codes, and redeem them officially.'],
  },
  es: {
    calendario: ['Calendario de banners', 'Períodos confirmados en anuncios oficiales.'],
    personagens: ['Personajes', 'Perfiles y guías de personajes por juego.'],
    equipes: ['Composiciones de equipo', 'Funciones y sinergias de equipos por versión.'],
    artigos: ['Artículos', 'Guías y cobertura editorial.'],
    builds: ['Configuraciones', 'Equipamiento, equipos y prioridades de mejora.'],
    'tier-lists': ['Clasificaciones', 'Clasificaciones de personajes por versión, función y modo.'],
    codigos: ['Códigos de canje', 'Consulta recompensas y plazos, copia códigos y cánjealos por el canal oficial.'],
  },
} as const;

export function localizedSection(slug: Section['slug'], locale: Locale) {
  const section = sections.find(entry => entry.slug === slug)!;
  const [title, description] = locale === 'pt-BR' ? [section.title, section.description] : categoryCopy[locale][slug];
  return { title, description };
}
