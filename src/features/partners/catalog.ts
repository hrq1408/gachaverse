import { z } from 'zod';

const https = z.url({ protocol: /^https$/ }).refine(value => {
  const { username, password } = new URL(value);
  return !username && !password;
});

const schema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  title: z.string().trim().min(1),
  partner: z.string().trim().min(1),
  description: z.string().trim().min(1),
  url: https,
  relationship: z.enum(['afiliado', 'parceria']),
  category: z.enum(['produto', 'recarga']),
  authorizationUrl: https.optional(),
  approved: z.boolean(),
}).strict().refine(offer => offer.category !== 'recarga' || !!offer.authorizationUrl, 'Recarga exige comprovação do publicador');

export type PartnerOffer = z.infer<typeof schema>;

export function visibleOffers(enabled: boolean, entries: unknown) {
  if (!enabled) return [];
  const offers = z.array(schema).parse(entries);
  if (new Set(offers.map(offer => offer.id)).size !== offers.length) throw new Error('Oferta duplicada');
  return offers.filter(offer => offer.approved);
}

export const partnerOffers = visibleOffers(process.env.NEXT_PUBLIC_PARTNER_OFFERS_ENABLED === 'true', []);
