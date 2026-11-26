'use client';

import { readPreference, trackAction } from '@/lib/analytics';
import type { PartnerOffer } from './catalog';

export function CommercialLink({ id, relationship, url }: Pick<PartnerOffer, 'id' | 'relationship' | 'url'>) {
  return <a className="button secondary" href={url} rel="sponsored noopener" target="_blank" onClick={() => {
    if (readPreference() === 'accepted') trackAction('commercial_offer_click', { offer_id: id, relationship });
  }}>Ver no site do parceiro (nova aba)</a>;
}
