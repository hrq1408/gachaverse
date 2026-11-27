import { homePath, languageAlternates, type TranslationLocale } from './locales';

export const toolRoutes = {
  codes: { 'pt-BR': '/conteudo/codigos/', en: 'codes', es: 'codigos' },
  calendar: { 'pt-BR': '/conteudo/calendario/', en: 'banner-calendar', es: 'calendario' },
  pity: { 'pt-BR': '/ferramentas/calculadora-pity/', en: 'pity-calculator', es: 'calculadora-pity' },
  search: { 'pt-BR': '/busca/', en: 'search', es: 'buscar' },
  about: { 'pt-BR': '/sobre/', en: 'about', es: 'sobre' },
  contact: { 'pt-BR': '/contato/', en: 'contact', es: 'contacto' },
  privacy: { 'pt-BR': '/privacidade/', en: 'privacy', es: 'privacidad' },
  advertising: { 'pt-BR': '/publicidade-e-afiliados/', en: 'advertising-and-affiliates', es: 'publicidad-y-afiliados' },
  advertise: { 'pt-BR': '/anuncie/', en: 'advertise', es: 'anuncia' },
} as const;
export type ToolPage = keyof typeof toolRoutes;
export const toolPages = Object.keys(toolRoutes) as ToolPage[];
export const toolPath = (page: ToolPage, locale: 'pt-BR' | TranslationLocale) =>
  locale === 'pt-BR' ? toolRoutes[page][locale] : homePath(locale) + toolRoutes[page][locale] + '/';
export const toolAlternates = (page: ToolPage) => languageAlternates({
  'pt-BR': toolPath(page, 'pt-BR'), en: toolPath(page, 'en'), es: toolPath(page, 'es'),
});
export const codeGameAlternates = (game: string) => languageAlternates({
  'pt-BR': '/jogos/' + game + '/codigos/', en: toolPath('codes', 'en') + game + '/', es: toolPath('codes', 'es') + game + '/',
});
export const gameHubPath = (game: string, locale: 'pt-BR' | TranslationLocale) =>
  homePath(locale) + (locale === 'en' ? 'games/' : locale === 'es' ? 'juegos/' : 'jogos/') + game + '/';
export const gameHubAlternates = (game: string) => languageAlternates({
  'pt-BR': gameHubPath(game, 'pt-BR'), en: gameHubPath(game, 'en'), es: gameHubPath(game, 'es'),
});

export function legacyToolAlternates(path: string) {
  const game = /^\/jogos\/([^/]+)\/codigos\/$/.exec(path)?.[1];
  if (game) return codeGameAlternates(game);
  const hub = /^\/jogos\/([^/]+)\/$/.exec(path)?.[1];
  if (hub) return gameHubAlternates(hub);
  const route = toolPages.find(page => page !== 'search' && toolPath(page, 'pt-BR') === path);
  return route ? toolAlternates(route) : {};
}

export const toolTitles = {
  en: {
    codes: ['Redemption codes', 'Browse redemption codes by game, check their sources, and open official redemption channels.'],
    calendar: ['Banner calendar', 'See confirmed banner dates for all four games and check the original publisher announcements.'],
    pity: ['Honkai: Star Rail pity calculator', 'Plan how many pulls and Stellar Jades you may need for a featured character or Light Cone.'],
    search: ['Search guides', 'Find reviewed English-language guides by title, topic, or game.'],
    about: ['About GachaVerse', 'Learn about our independent gacha game guides and update process.'],
    contact: ['Contact', 'Learn how to report an error or contact the GachaVerse team.'],
    privacy: ['Privacy policy', 'Understand the services that process data when you visit GachaVerse and manage your choices.'],
    advertising: ['Advertising and affiliates', 'How GachaVerse identifies advertising, affiliate links, and commercial partnerships.'],
    advertise: ['Advertise on GachaVerse', 'Contact GachaVerse about an editorially independent commercial partnership.'],
  },
  es: {
    codes: ['Códigos de canje', 'Consulta códigos por juego, comprueba sus fuentes y abre los canales oficiales de canje.'],
    calendar: ['Calendario de banners', 'Consulta los plazos confirmados de los cuatro juegos y sus anuncios oficiales.'],
    pity: ['Calculadora de pity de Honkai: Star Rail', 'Calcula los saltos y el Jade estelar que podrías necesitar para un personaje o cono de luz destacado.'],
    search: ['Buscar guías', 'Encuentra guías revisadas en español por título, tema o juego.'],
    about: ['Sobre GachaVerse', 'Conoce nuestras guías independientes de juegos gacha y cómo las actualizamos.'],
    contact: ['Contacto', 'Consulta cómo señalar un error o contactar con el equipo de GachaVerse.'],
    privacy: ['Política de privacidad', 'Entiende qué servicios reciben datos al visitar GachaVerse y cómo gestionar tus preferencias.'],
    advertising: ['Publicidad y afiliados', 'Cómo identifica GachaVerse la publicidad, los enlaces de afiliados y las colaboraciones comerciales.'],
    advertise: ['Anúnciate en GachaVerse', 'Contacta con GachaVerse para proponer una colaboración que respete su independencia editorial.'],
  },
} as const;
