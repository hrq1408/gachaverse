import { games, gamePath, sectionPath, sections, type Game, type Section } from './catalog';

import { articles, type Article } from './articles';
export { articles };

export type RedemptionCode = {
  game: Game['slug'];
  code: string;
  reward: string;
  verifiedOn: string;
  expiresAt?: string;
  source: string;
};

export const redemptionCodes: readonly RedemptionCode[] = [];
export const editorialSnapshotTime = Date.now();

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

export function activeCodes(game: Game, now: number) {
  return redemptionCodes.filter((entry) =>
    entry.game === game.slug &&
    (!entry.expiresAt || Date.parse(entry.expiresAt) > now),
  );
}

export function publishedSections(game?: Game) {
  return sections.filter((section) => section.slug === 'codigos' || findArticles(section, game).length > 0);
}

export function publicPaths() {
  return [
    '/', '/jogos/', '/sobre/', '/privacidade/', '/contato/', '/ferramentas/', '/ferramentas/calculadora-pity/', '/ferramentas/warp-tracker/',
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

