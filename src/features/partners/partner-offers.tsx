import Link from 'next/link';
import { partnerOffers, type PartnerOffer } from './catalog';
import { CommercialLink } from './commercial-link';

export function PartnerOfferCard({ offer }: { offer: PartnerOffer }) {
  return <article className="panel">
    <p className="eyebrow">{offer.relationship === 'afiliado' ? 'Link de afiliado' : 'Parceria comercial'}</p>
    <h3>{offer.title}</h3>
    <p>{offer.partner} · {offer.description}</p>
    <p>{offer.relationship === 'afiliado' ? 'O GachaVerse pode receber comissão se você comprar por este link.' : 'Este espaço identifica uma relação comercial com o parceiro.'}</p>
    <p><CommercialLink id={offer.id} relationship={offer.relationship} url={offer.url} /></p>
    {offer.authorizationUrl && <p><a href={offer.authorizationUrl}>Consultar a autorização do publicador</a></p>}
  </article>;
}

export function PartnerOffers() {
  if (!partnerOffers.length) return null;
  return <section aria-labelledby="partner-offers">
    <div className="section-heading"><h2 id="partner-offers">Ofertas de parceiros</h2><Link href="/publicidade-e-afiliados/">Como funcionam as parcerias</Link></div>
    <div className="editorial-grid">{partnerOffers.map(offer => <PartnerOfferCard key={offer.id} offer={offer} />)}</div>
  </section>;
}
