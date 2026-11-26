import { z } from 'zod';
import { codeStatus } from '../lib/redemption-status';
import records from '../../content/resgates/catalogo.json';
import { games, type Game } from './catalog';

const source = z.object({
  title: z.string().trim().min(1),
  url: z.url({ protocol: /^https$/ }),
  type: z.enum(['oficial', 'editorial', 'comunidade']),
}).strict();

const record = z.object({
  game: z.enum(games.map(game => game.slug)),
  code: z.string().regex(/^[A-Za-z0-9]{4,40}$/),
  rewards: z.array(z.string().trim().min(1)).min(1),
  verifiedOn: z.iso.date(),
  publishedOn: z.iso.date().optional(),
  expiresAt: z.iso.datetime({ offset: true }).optional(),
  editorialNote: z.string().trim().min(1).optional(),
  needsReview: z.boolean().optional(),
  sources: z.array(source).min(1),
}).strict().refine(entry => new Set(entry.sources.map(item => item.url)).size === entry.sources.length, 'Fontes repetidas')
  .refine(entry => !entry.expiresAt || entry.sources.some(item => item.type === 'oficial'), 'Prazo confirmado exige anúncio oficial')
  .refine(entry => !entry.publishedOn || entry.publishedOn <= entry.verifiedOn, 'Data do anúncio posterior à conferência')
  .refine(entry => entry.sources.some(item => item.type === 'oficial') || entry.sources.length >= 2, 'Use fonte oficial ou duas fontes distintas');

export type RedemptionCode = z.infer<typeof record>;

export function validateCodes(input: unknown, now = Date.now()) {
  const parsed = z.array(record).parse(input);
  const keys = new Set<string>();
  const today = new Date(now).toISOString().slice(0, 10);
  for (const entry of parsed) {
    const key = entry.game + ':' + entry.code.toUpperCase();
    if (keys.has(key)) throw new Error('Código duplicado: ' + key);
    if (entry.verifiedOn > today) throw new Error('Verificação futura: ' + key);
    keys.add(key);
  }
  return parsed;
}

export const redemptionCodes = validateCodes(records);
export const redemptionSnapshot = Date.now();

export function activeCodes(game: Game, now: number) {
  return redemptionCodes.filter(entry => entry.game === game.slug &&
    ['no-prazo', 'sem-prazo'].includes(codeStatus(entry, now)));
}
