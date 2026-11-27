import type { Locale } from './locales';

const bannerNames: Record<string, Partial<Record<Locale, string>>> = {
  'Fragmento Lunar da Luz': { en: 'Lightbearing Moonshard', es: 'Refulgencia de la Luna' },
  'Ramo Dourado do Juramento Gelado': { en: 'Golden Frostbound Oath', es: 'Rama del Juramento Escarchado' },
  Linnea: { es: 'Linnéa' },
};

export const localizedBannerName = (value: string, locale: Locale) => bannerNames[value]?.[locale] ?? value;

const rewards: Record<string, readonly [string, string]> = {
  "Astrites": [
    "Astrite",
    "Astrita"
  ],
  "balões de Éon": [
    "Aeon Balloons",
    "globos de Eón"
  ],
  "Combustível": [
    "Fuel",
    "Combustible"
  ],
  "Créditos": [
    "Credits",
    "Créditos"
  ],
  "Dennies": [
    "Dennies",
    "deniques"
  ],
  "Experiências do Aventureiro": [
    "Adventurer’s Experience",
    "Experiencia del Aventurero"
  ],
  "Gemas Essenciais": [
    "Primogems",
    "Protogemas"
  ],
  "Guias do Viajante": [
    "Traveler’s Guides",
    "Guías del viajero"
  ],
  "Jades Estelares": [
    "Stellar Jades",
    "Jade estelar"
  ],
  "Lições do Herói": [
    "Hero’s Wit",
    "Ingenio del Héroe"
  ],
  "Materiais de experiência": [
    "EXP materials",
    "Materiales de EXP"
  ],
  "Minérios de Refinamento Fino": [
    "Fine Enhancement Ore",
    "Mineral de refinamiento fino"
  ],
  "Mora": [
    "Mora",
    "Mora"
  ],
  "Poções de Ressonância Premium": [
    "Premium Resonance Potions",
    "Pociones de resonancia prémium"
  ],
  "Policromos": [
    "Polychromes",
    "películas"
  ]
};
const notes: Record<string, readonly [string, string]> = {
  "As fontes divergem sobre a disponibilidade. Não foi localizado um prazo oficial.": [
    "Sources disagree on availability. An official deadline could not be found.",
    "Las fuentes discrepan sobre la disponibilidad. No se encontró un plazo oficial."
  ],
  "As fontes divergem sobre as quantidades e relatam disponibilidade intermitente.": [
    "Sources report different amounts and intermittent availability.",
    "Las fuentes indican cantidades distintas y señalan disponibilidad intermitente."
  ],
  "As listas divergem sobre a disponibilidade atual.": [
    "The lists disagree on current availability.",
    "Las listas discrepan sobre la disponibilidad actual."
  ],
  "Uma lista aponta 2 de dezembro como prazo. Horário e prazo oficiais não foram localizados.": [
    "One list gives December 2 as the deadline. An official date and time could not be found.",
    "Una lista indica el 2 de diciembre como fecha límite. No se encontraron una fecha ni una hora oficiales."
  ]
};

export function localizedReward(value: string, locale: Locale) {
  const match = /^(\d[\d.]*)\s+(.+)$/.exec(value);
  const translation = locale === 'pt-BR' || !match ? undefined : rewards[match[2]]?.[locale === 'en' ? 0 : 1];
  if (!match || !translation) return { text: value, lang: 'pt-BR' };
  const amount = Number(match[1].replaceAll('.', ''));
  return { text: new Intl.NumberFormat(locale).format(amount) + ' ' + translation, lang: locale };
}

export function localizedCodeNote(value: string, locale: Locale) {
  const text = locale === 'pt-BR' ? undefined : notes[value]?.[locale === 'en' ? 0 : 1];
  return text ? { text, lang: locale } : { text: value, lang: 'pt-BR' };
}
