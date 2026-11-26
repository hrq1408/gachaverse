import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { games } from '../src/content/catalog';

const game = z.enum(games.map(item => item.slug));
const code = z.string().regex(/^[A-Za-z0-9]{4,40}$/);
const video = z.string().regex(/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
const timestamp = z.iso.datetime({ offset: true });
const proposal = z.object({
  candidates: z.array(z.object({
    game, code, source: video, reward: z.number().int().nonnegative().optional(),
    expiresAt: timestamp.optional(), notes: z.array(z.string().min(1)).nonempty(),
  }).strict()),
  recentlyExpired: z.array(z.object({ game, code, expiresAt: timestamp }).strict()),
  calendar: z.object({
    candidates: z.array(z.object({
      game, version: z.string().regex(/^\d+\.\d+$/), event: z.string().regex(/^(?:programa-especial|previa-da-versao|anuncio-de-banner|fase-[1-9])$/),
      sources: z.array(video).nonempty().refine(sources => new Set(sources).size === sources.length),
    }).strict()).refine(rows => new Set(rows.map(({ game, version, event }) => [game, version, event].join('/'))).size === rows.length,
      'Evento de banner duplicado'),
    expired: z.array(z.object({ id: z.string().min(1), game, end: z.iso.date(), endTime: z.iso.time({ precision: -1 }) }).strict()),
    uncovered: z.array(game),
  }).strict(),
}).strict();

export function proposalKey(value: unknown) {
  const { calendar, ...rest } = proposal.parse(value);
  return JSON.stringify({
    ...rest,
    calendar: { ...calendar, candidates: calendar.candidates.map(({ game, version, event }) => ({ game, version, event })) },
  });
}

if (process.argv[1] && /(?:^|[/\\])proposal-check\.ts$/.test(process.argv[1])) {
  const [file, previous] = process.argv.slice(2);
  const next = proposalKey(JSON.parse(readFileSync(file, 'utf8')));
  if (previous) {
    let stored: string | undefined;
    try { stored = proposalKey(JSON.parse(readFileSync(previous, 'utf8'))); } catch { /* Arquivo ausente ou proposta de formato anterior. */ }
    if (next !== stored) process.exitCode = 1;
  }
}
