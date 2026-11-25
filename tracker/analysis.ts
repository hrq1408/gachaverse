import { starRail } from '../src/features/pity/config/games';
import type { Row } from './formats';

export function analyze(rows: Row[], family: Row['family']) {
  const history = rows.filter((r) => r.family === family);
  const rule = starRail.banners.find(
    (b) => b.id === ({ '11': 'personagem', '12': 'cone' } as Record<string, string>)[family],
  );
  const months: Record<string, number> = {},
    rarities: Record<string, number> = {};
  const cycles: number[] = [];
  let distance = 0,
    anchored = false,
    inconsistent = false;
  for (const r of [...history].reverse()) {
    const month = (r.source?.time ?? new Date(r.instant).toISOString()).slice(0, 7);
    months[month] = (months[month] ?? 0) + 1;
    const rank = r.rank ?? 'Sem raridade';
    rarities[rank] = (rarities[rank] ?? 0) + 1;
    distance++;
    if (r.source?.count && r.source.count !== '1') inconsistent = true;
    if (rule && (distance > rule.hardPity || (distance === rule.hardPity && r.rank && r.rank !== '5')))
      inconsistent = true;
    if (!r.rank) {
      anchored = false;
      distance = 0;
    }
    if (r.rank === '5') {
      if (anchored) cycles.push(distance);
      anchored = true;
      distance = 0;
    }
  }
  const lastFive = history.find((r) => r.rank === '5');
  // After a confirmed off-banner result, the next five-star in the same
  // uninterrupted family consumes the guarantee, even without its item name.
  const observations = history.filter((row) => !row.rank || row.rank === '5');
  const preceding = observations[1];
  const inferred = preceding?.rank === '5' && preceding.featured === false ? true : undefined;
  const guarantee = rule && anchored && !inconsistent ? (lastFive?.featured ?? inferred) : undefined;
  return {
    history,
    rule,
    months,
    rarities,
    cycles,
    lastFive,
    distance,
    anchored,
    inconsistent,
    guarantee: guarantee === undefined ? 'Indeterminada' : guarantee ? 'Sem garantia ativa' : 'Ativa',
  };
}

// Constant base-rate model, with a forced success at hard pity. No soft-pity curve.
export function probability(pity: number, pulls: number, hard: number, rate: number) {
  if (
    !Number.isInteger(pity) ||
    pity < 0 ||
    pity >= hard ||
    !Number.isInteger(pulls) ||
    pulls < 0 ||
    !(rate > 0 && rate < 1)
  )
    throw Error('Parâmetros inválidos.');
  return pulls >= hard - pity ? 1 : 1 - Math.pow(1 - rate, pulls);
}
