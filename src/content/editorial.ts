import { games, gamePath, sectionPath, sections, type Game, type Section } from './catalog';

type Source = { label: string; url: string };
type Article = {
  slug: string;
  section: Exclude<Section['slug'], 'codigos'>;
  title: string;
  summary: string;
  paragraphs: readonly string[];
  sources: readonly Source[];
  game?: Game['slug'];
  version?: string;
};

export const articles: readonly Article[] = [
  {
    slug: 'onde-resgatar-codigos',
    section: 'artigos',
    title: 'Onde resgatar códigos dos quatro jogos',
    summary: 'Encontre os portais da HoYoverse e o caminho pelo menu de Wuthering Waves.',
    paragraphs: [
      'Genshin Impact, Honkai: Star Rail e Zenless Zone Zero têm páginas de resgate mantidas pela HoYoverse. Abra a página correspondente ao seu jogo e siga as instruções do portal.',
      'Em Wuthering Waves, a Kuro Games orienta a abrir as configurações dentro do jogo, entrar em Outros e selecionar Código de resgate. Depois de confirmar, confira a caixa de correio do jogo.',
      'Confira a validade e as condições na publicação original antes de tentar usar um código. Use apenas o site oficial ou o menu interno do jogo para fazer o resgate.',
    ],
    sources: games.map((game) => ({ label: game.name, url: game.redemption })),
  },
];

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
  return articles.filter((article) =>
    article.section === section.slug && (!game || article.game === game.slug),
  );
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

export function publicPaths() {
  return [
    '/', '/jogos/', '/sobre/',
    ...sections.filter((section) => section.slug === 'codigos' || findArticles(section).length)
      .map((section) => sectionPath(section)),
    ...games.flatMap((game) => [
      gamePath(game),
      ...sections.filter((section) => section.slug === 'codigos' || findArticles(section, game).length)
        .map((section) => sectionPath(section, game)),
    ]),
    ...articles.map(contentPath),
  ];
}

