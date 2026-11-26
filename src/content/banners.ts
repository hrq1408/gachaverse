import { z } from 'zod';
import { games, type Game } from '@/content/catalog';

const sources = {
  'honkai-star-rail': 'https://www.hoyolab.com/article/47385253',
  'genshin-impact': 'https://genshin.hoyoverse.com/pt/news/detail/167370',
  'zenless-zone-zero': 'https://zenless.hoyoverse.com/m/en-us/news/167269',
  'wuthering-waves': 'https://wutheringwaves.kurogames.com/m/en/main/news/detail/5754',
} as const;

const entry = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  game: z.enum(games.map(game => game.slug)),
  source: z.url({ protocol: /^https$/ }),
  version: z.string().regex(/^\d+\.\d+$/),
  kind: z.enum(['personagem', 'equipamento', 'tematico']),
  highlights: z.array(z.string().trim().min(1)).nonempty(),
  start: z.iso.date(),
  startTime: z.iso.time({ precision: -1 }).optional(),
  end: z.iso.date(),
  endTime: z.iso.time({ precision: -1 }),
  pityFamily: z.enum(['personagem', 'cone']).optional(),
}).strict().refine(row => new URL(row.source).hostname === new URL(sources[row.game]).hostname)
  .refine(row => row.start < row.end && (!row.pityFamily ||
  (row.game === 'honkai-star-rail' && (row.pityFamily === 'cone' ? row.kind === 'equipamento' : row.kind === 'personagem'))));

export type Banner = z.infer<typeof entry>;

export function validateBanners(data: unknown) {
  const result = z.array(entry).parse(data);
  if (new Set(result.map(row => row.id)).size !== result.length) throw new Error('ID de banner duplicado');
  return result;
}

const hsr = { game: 'honkai-star-rail', source: sources['honkai-star-rail'], version: '4.7', start: '2026-11-11' } as const;
const gi = { game: 'genshin-impact', source: sources['genshin-impact'], version: '7.2', start: '2026-11-24', startTime: '18:00', end: '2026-12-15', endTime: '14:59' } as const;
const zzz = { game: 'zenless-zone-zero', source: sources['zenless-zone-zero'], version: '3.3', start: '2026-11-11', startTime: '12:00', end: '2026-12-01', endTime: '14:59' } as const;
const wuwa = { game: 'wuthering-waves', source: sources['wuthering-waves'], version: '3.8', start: '2026-11-12', end: '2026-12-03', endTime: '09:59' } as const;

export const banners = validateBanners([
  { ...hsr, id: 'hsr-47-aha', kind: 'personagem', highlights: ['Aeon ★ Aha'], end: '2026-12-22', endTime: '15:00', pityFamily: 'personagem' },
  { ...hsr, id: 'hsr-47-cone-aha', kind: 'equipamento', highlights: ['Upon the First Echo of Aha'], end: '2026-12-22', endTime: '15:00', pityFamily: 'cone' },
  { ...hsr, id: 'hsr-47-retornos', kind: 'personagem', highlights: ['Silver Wolf LV.999', 'Sparxie', 'Yao Guang'], end: '2026-12-02', endTime: '11:59' },
  { ...hsr, id: 'hsr-47-cones-retornos', kind: 'equipamento', highlights: ['Welcome to the Cosmic City', 'Dazzled by a Flowery World', 'When She Decided to See'], end: '2026-12-02', endTime: '11:59', pityFamily: 'cone' },
  { ...gi, id: 'gi-72-personagens', kind: 'personagem', highlights: ['Zibai', 'Linnea'] },
  { ...gi, id: 'gi-72-armas', kind: 'equipamento', highlights: ['Fragmento Lunar da Luz', 'Ramo Dourado do Juramento Gelado'] },
  { ...gi, id: 'gi-72-tematico', kind: 'tematico', highlights: ['Varesa', 'Chasca', 'Xilonen', 'Mualani', 'Kinich'] },
  { ...zzz, id: 'zzz-33-agentes', kind: 'personagem', highlights: ['Severian', 'Norma'] },
  { ...zzz, id: 'zzz-33-equipamentos', kind: 'equipamento', highlights: ['Incarcerating Grip', 'Chief Sidekick'] },
  { ...wuwa, id: 'wuwa-38-ressonadores', kind: 'personagem', highlights: ['Sigrika', 'Qiuyuan'] },
  { ...wuwa, id: 'wuwa-38-armas', kind: 'equipamento', highlights: ['Solsworn Ciphers', 'Emerald Sentence'] },
]);

export const bannersCheckedOn = '2026-11-26';
export const gameBanners = (game?: Game) => banners.filter(row => !game || row.game === game.slug);

export const bannerAnnouncements = [
  {
    game: 'zenless-zone-zero',
    version: '3.4',
    event: 'programa-especial',
    title: 'Zenless Zone Zero 3.4 — Os Últimos Vestígios do Dia',
    release: '2026-12-02',
    highlights: [
      'A atualização estreia Alvorada (Sunbringer), anunciada como a primeira Agente de entrelace.',
      'Robin, Agente de Classe S da colaboração, foi anunciada como recompensa de login durante o evento.',
      'A HoYoverse anunciou Kafka na Busca de Sinal por Tempo Limitado após 1º de janeiro.',
    ],
    scheduleNote: 'O comunicado não especifica os horários de abertura e encerramento dessas Buscas de Sinal por servidor.',
    source: 'https://zenless.hoyoverse.com/m/pt-pt/news/167400',
  },
] as const;

export function bannerStatus(banner: Banner, now: number) {
  // A hora do anúncio é local ao servidor. Use limites conservadores até confirmar a zona.
  const hour = 3600000;
  const start = Date.parse(banner.start + 'T' + (banner.startTime ?? '00:00') + 'Z');
  const end = Date.parse(banner.end + 'T' + banner.endTime + 'Z');
  if (now >= end + 12 * hour) return 'Encerrado';
  if (now < start - 14 * hour) return 'Programado';
  if (now >= start + (banner.startTime ? 12 : 36) * hour && now < end - 14 * hour) return 'Em andamento';
  return 'Confira no servidor';
}
