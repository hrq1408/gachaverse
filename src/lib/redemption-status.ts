import type { RedemptionCode } from '../content/redemption';
export const reviewIntervalDays = 7;
const day = 86400000;
export type CodeStatus = 'no-prazo' | 'sem-prazo' | 'expirado' | 'revisao';

export function codeStatus(entry: RedemptionCode, now: number): CodeStatus {
  if (entry.expiresAt && Date.parse(entry.expiresAt) <= now) return 'expirado';
  if (entry.needsReview || now - Date.parse(entry.verifiedOn) >= reviewIntervalDays * day) return 'revisao';
  return entry.expiresAt ? 'no-prazo' : 'sem-prazo';
}

export function isRecent(entry: RedemptionCode, now: number) {
  return Boolean(entry.publishedOn && now >= Date.parse(entry.publishedOn) &&
    now - Date.parse(entry.publishedOn) < 14 * day);
}

export function confirmedTimeLeft(entry: RedemptionCode, now: number) {
  return entry.expiresAt ? Math.max(0, Date.parse(entry.expiresAt) - now) : null;
}
