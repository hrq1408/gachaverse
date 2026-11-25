export type BannerRule = { id: string; label: string; hardPity: number; baseRate: number };
export type GameRules = {
  id: string; name: string; currency: string; currencySingular: string; tickets: string; cost: number;
  banners: readonly BannerRule[];
};
export type Plan = { pity: number; guaranteed: boolean; currency: number; tickets: number };
export const emptyPlan = (): Plan => ({ pity: 0, guaranteed: false, currency: 0, tickets: 0 });

export function whole(value: number, max = Number.MAX_SAFE_INTEGER) {
  return Number.isFinite(value) ? Math.min(max, Math.max(0, Math.floor(value))) : 0;
}

export function calculate(plan: Plan, banner: BannerRule, cost: number) {
  const next = banner.hardPity - whole(plan.pity, banner.hardPity - 1);
  const target = next + (plan.guaranteed ? 0 : banner.hardPity);
  const currency = whole(plan.currency);
  const tickets = whole(plan.tickets);
  const available = whole(Math.floor(currency / cost) + tickets);
  return { next, target, available, missing: Math.max(0, target - available),
    currencyMissing: Math.max(0, Math.max(0, target - tickets) * cost - currency),
    covered: Math.min(available, target) };
}
