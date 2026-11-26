import { z } from 'zod';
import { emptyPlan, type GameRules, type Plan } from './calculation';

const integer = z.number().int().nonnegative();
const snapshot = z.object({ version: z.literal(1), selected: z.string(),
  plans: z.record(z.string(), z.unknown()) });
const planSchema = z.object({ pity: integer, currency: integer, tickets: integer, guaranteed: z.boolean() });
export type Snapshot = { version: 1; selected: string; plans: Record<string, Plan> };

export function restore(raw: string | null, game: GameRules): Snapshot {
  let saved: z.infer<typeof snapshot> | undefined;
  try { saved = snapshot.safeParse(JSON.parse(raw ?? 'null')).data; } catch { /* Invalid JSON. */ }
  const plans: Record<string, Plan> = {};
  for (const banner of game.banners) {
    const plan = planSchema.safeParse(saved?.plans[banner.id]).data;
    plans[banner.id] = plan && plan.pity < banner.hardPity ? plan : emptyPlan();
  }
  const selected = game.banners.find(b => b.id === saved?.selected)?.id ?? game.banners[0].id;
  return { version: 1, plans, selected };
}

export function updatePlan(state: Snapshot, plan: Plan, family = state.selected): Snapshot {
  return { ...state, plans: { ...state.plans, [family]: plan } };
}
