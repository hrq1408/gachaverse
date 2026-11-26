export const games = [
  {
    slug: 'honkai-star-rail', name: 'Honkai: Star Rail', mark: 'HSR', theme: 'rail',
    studio: 'HoYoverse', official: 'https://hsr.hoyoverse.com/',
    redemption: 'https://hsr.hoyoverse.com/gift',
  },
  {
    slug: 'genshin-impact', name: 'Genshin Impact', mark: 'GI', theme: 'genshin',
    studio: 'HoYoverse', official: 'https://genshin.hoyoverse.com/pt/',
    redemption: 'https://genshin.hoyoverse.com/pt/gift',
  },
  {
    slug: 'zenless-zone-zero', name: 'Zenless Zone Zero', mark: 'ZZZ', theme: 'zenless',
    studio: 'HoYoverse', official: 'https://zenless.hoyoverse.com/',
    redemption: 'https://zenless.hoyoverse.com/redemption',
  },
  {
    slug: 'wuthering-waves', name: 'Wuthering Waves', mark: 'WuWa', theme: 'waves',
    studio: 'Kuro Games', official: 'https://wutheringwaves.kurogames.com/en/',
    redemption: 'https://wutheringwaves.kurogames.com/en/main/news/detail/728',
    redemptionSteps: 'No jogo, abra Configurações, entre em Outros e selecione Código de resgate. Confirme o código e confira a caixa de correio do jogo.',
  },
] as const;

export const sections = [
  { slug: 'calendario', title: 'Calendário de banners', description: 'Períodos de banners confirmados em anúncios oficiais.' },
  { slug: 'personagens', title: 'Personagens', description: 'Perfis e guias de personagens por jogo.' },
  { slug: 'equipes', title: 'Composições de equipe', description: 'Guias de composição, funções e sinergias por versão.' },
  { slug: 'artigos', title: 'Artigos', description: 'Guias e cobertura editorial em português.' },
  { slug: 'builds', title: 'Builds', description: 'Equipamentos, composição de equipes e prioridades de melhoria.' },
  { slug: 'tier-lists', title: 'Tier lists', description: 'Classificações de personagens por versão, função e modo de jogo.' },
  { slug: 'codigos', title: 'Códigos de resgate', description: 'Consulte códigos, recompensas e prazos. Copie o código e acesse o canal oficial de cada jogo.' },
] as const;

export type Game = typeof games[number];
export type Section = typeof sections[number];

export const gamePath = (game: Game) => `/jogos/${game.slug}/`;
export const sectionPath = (section: Section, game?: Game) =>
  `${game ? gamePath(game) : '/conteudo/'}${section.slug}/`;

