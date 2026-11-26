import type { ReactNode } from 'react';
import { advertisingPolicy, eligible, placements, type Placement } from './config';

// Manual placements have their own release decision and integration.
const manualAdsReleased = false;

export function AdProvider({ placement, children }: { placement: Placement; children: ReactNode }) {
  return manualAdsReleased && eligible(advertisingPolicy, placements[placement].unit) ? children : null;
}
export function AdPlaceholder({ placement }: { placement: Placement }) {
  return <aside aria-label="Publicidade" className={'ad-banner ad-banner--' + placements[placement].format}><span>Publicidade</span></aside>;
}
export function AdSlot({ placement }: { placement: Placement }) {
  return <AdProvider placement={placement}><AdPlaceholder placement={placement}/></AdProvider>;
}
