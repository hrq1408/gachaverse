import { games, gamePath, sectionPath, sections, type Game, type Section } from './catalog';

import { articles, type Article } from './articles';
import { gameBanners } from './banners';
export { articles };

export function findArticles(section: Section, game?: Game) {
  const entries = articles.filter((article) =>
    article.categoria === section.slug && (!game || article.jogos.includes(game.slug)),
  );
  if (section.slug === 'calendario') entries.sort((a, b) => Date.parse(a.periodo!.inicio) - Date.parse(b.periodo!.inicio));
  return entries;
}

export function contentPath(article: Article) {
  return `/artigos/${article.slug}/`;
}

export function publishedSections(game?: Game) {
  return sections.filter(section => sectionHasContent(section, game));
}

export function sectionHasContent(section: Section, game?: Game) {
  return section.slug === 'codigos' || (section.slug === 'calendario' && gameBanners(game).length > 0) ||
    findArticles(section, game).length > 0;
}

export function publicPaths() {
  return [
    '/', '/jogos/', '/sobre/', '/privacidade/', '/publicidade-e-afiliados/', '/anuncie/', '/contato/', '/ferramentas/', '/ferramentas/calculadora-pity/', '/ferramentas/warp-tracker/',
    ...publishedSections()
      .map((section) => sectionPath(section)),
    ...games.flatMap((game) => [
      gamePath(game),
      ...publishedSections(game)
        .map((section) => sectionPath(section, game)),
    ]),
    ...articles.map(contentPath),
  ];
}

