export type TrackerLocale = 'pt-BR' | 'en' | 'es';

export const trackerLocale: TrackerLocale = (() => {
  if (typeof location === 'undefined') return 'pt-BR';
  const lang = new URLSearchParams(location.search).get('lang');
  return lang === 'en' || lang === 'es' ? lang : 'pt-BR';
})();

export const tr = (pt: string, en: string, es: string) => trackerLocale === 'en' ? en : trackerLocale === 'es' ? es : pt;

export const trackerPortal = trackerLocale === 'en' ? 'https://gachaverse.pages.dev/en/pity-calculator/'
  : trackerLocale === 'es' ? 'https://gachaverse.pages.dev/es/calculadora-pity/'
  : 'https://gachaverse.pages.dev/ferramentas/warp-tracker/';
