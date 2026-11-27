import Link from 'next/link';
import { advertisingPolicy, adsenseClient, autoAdsEnabled, autoAdsSource } from '@/features/advertising/config';
import type { TranslationLocale } from './locales';
import { toolPath, type ToolPage } from './tools';

type Institution = Extract<ToolPage, 'about' | 'contact' | 'privacy' | 'advertising' | 'advertise'>;
export const institutionHeadings: Record<TranslationLocale, Record<Institution, { eyebrow: string; title?: string }>> = {
  en: { about: { eyebrow: 'About the portal', title: 'GachaVerse' }, contact: { eyebrow: 'GachaVerse' }, privacy: { eyebrow: 'GachaVerse' },
    advertising: { eyebrow: 'GachaVerse' }, advertise: { eyebrow: 'Commercial partnerships' } },
  es: { about: { eyebrow: 'Sobre el portal', title: 'GachaVerse' }, contact: { eyebrow: 'GachaVerse' }, privacy: { eyebrow: 'GachaVerse' },
    advertising: { eyebrow: 'GachaVerse' }, advertise: { eyebrow: 'Colaboraciones comerciales' } },
};

const sectionLabels = {
  en: { criteria: 'Editorial criteria', corrections: 'Corrections', advertising: 'Advertising', contact: 'Contact the project',
    independence: 'Advertising and editorial independence', affiliate: 'Affiliate links', offers: 'Offers and top-ups',
    analytics: 'Measurement and privacy', formats: 'Formats we can consider', proposal: 'How to send a proposal',
    calculator: 'Pity calculator', tracker: 'Warp Tracker', cloudflare: 'Cloudflare privacy policy', google: 'How Google uses data from partner sites' },
  es: { criteria: 'Criterios editoriales', corrections: 'Correcciones', advertising: 'Publicidad', contact: 'Contacta con el proyecto',
    independence: 'Publicidad e independencia editorial', affiliate: 'Enlaces de afiliación', offers: 'Ofertas y recargas',
    analytics: 'Medición y privacidad', formats: 'Formatos que podemos evaluar', proposal: 'Cómo enviar una propuesta',
    calculator: 'Calculadora de pity', tracker: 'Warp Tracker', cloudflare: 'Política de privacidad de Cloudflare', google: 'Cómo usa Google los datos de sitios asociados' },
} as const;
const copy = {
  en: {
    about: [
      'GachaVerse is an independent guide portal covering Genshin Impact, Honkai: Star Rail, Zenless Zone Zero, and Wuthering Waves. It is unaffiliated with their publishers.',
      'Editorial guides explain game mechanics, planning tools, and redemption channels. We cite sources and review translations separately. Publisher announcements remain the reference for version changes and offers.',
    ],
    contact: [
      'Use the public GitHub issue tracker to report an error. For an editorial correction, include the page, the passage in question, and the official source. For a bug, describe what you expected and what happened.',
      'GitHub issues and usernames are public. For privacy questions, describe the request in general terms. Keep emails, documents, passwords, and account identifiers out of the issue.',
    ],
    privacy: [
      ['Visiting the portal', 'You can read the guides without signing in. Cloudflare delivers the site and receives technical connection data such as the IP address, requested page, and browser information. The language and theme preferences are stored in this browser.'],
      ['Analytics and preferences', 'Google Analytics loads only with your permission. We store your choice locally. Consented events use public pages and game or article identifiers. Query strings, fragments, and referrer addresses are not sent by the portal navigation events. Google may receive technical connection data and use first-party measurement cookies. Disable measurement under Cookie preferences in the footer to stop future measurement and clear the site’s measurement cookies. Clearing site data also clears preferences.'],
      ['Calculator and Warp Tracker', 'Calculator inputs stay in local storage. With analytics consent, interaction events exclude those inputs. The Warp Tracker stores history in IndexedDB on its separate origin and uses neither analytics nor advertising. Migration requires you to export and confirm an import.'],
      ['External links and contact', 'Official redemption services handle any account information or code you submit to them. GitHub reports are public. Consented commercial link events use the public offer ID and the type of commercial relationship, without the destination URL or purchase details.'],
    ],
    adTitle: 'Advertising',
    adOff: 'Ads are disabled. AdSense verification uses a metatag and ads.txt. Analytics consent applies to audience measurement.',
    adOn: 'When Google authorizes ad serving, AdSense can show ads on eligible Portuguese pages for traffic identified as coming from Brazil, with advertising permission. The regional check returns only an eligibility decision. You can withdraw permission in Cookie preferences. Analytics and advertising have separate choices.',
    advertising: [
      'GachaVerse identifies advertising, sponsored placements, and affiliate links. A commercial relationship does not determine editorial conclusions. A qualifying purchase through a disclosed affiliate link may generate compensation for the portal.',
      'An offer is published only after review of the destination, provider, and terms. We call a top-up official only when the publisher confirms authorization for that game, provider, and region.',
    ],
    advertise: [
      'We can evaluate clearly identified sponsorship of guides or calendars, campaigns related to the games we cover, or disclosed affiliate offers.',
      'Proposals go through review. Include your company’s public name, the game or topic, the format, and the requested dates. Keep personal data, credentials, and confidential terms out of the public contact channel.',
    ],
    github: 'Open the public GitHub issue tracker', contactLink: 'Contact GachaVerse', policy: 'Advertising and affiliates policy',
  },
  es: {
    about: [
      'GachaVerse es un portal independiente de guías de Genshin Impact, Honkai: Star Rail, Zenless Zone Zero y Wuthering Waves. No está afiliado a sus editores.',
      'Las guías explican mecánicas, herramientas de planificación y canales de canje. Citamos fuentes y revisamos cada traducción por separado. Los anuncios de los editores son la referencia para cambios de versión y ofertas.',
    ],
    contact: [
      'Usa el registro público de incidencias de GitHub para señalar errores. Para corregir una guía, incluye la página, el fragmento y la fuente oficial. Si comunicas un fallo, indica qué esperabas y qué ocurrió.',
      'Las incidencias y los nombres de usuario son públicos. Para consultas de privacidad, explica la solicitud en términos generales. Evita incluir correos, documentos, contraseñas o identificadores de cuenta.',
    ],
    privacy: [
      ['Visita al portal', 'Puedes leer las guías sin registrarte. Cloudflare entrega el sitio y recibe datos técnicos de conexión, como la dirección IP, la página solicitada y la información del navegador. Las preferencias de idioma y tema se guardan en este navegador.'],
      ['Analytics y preferencias', 'Google Analytics se carga solo con tu permiso. Guardamos tu elección localmente. Los eventos autorizados usan rutas públicas e identificadores de juegos o artículos. Los eventos de navegación del portal omiten parámetros de consulta, fragmentos y direcciones de referencia. Google puede recibir datos técnicos y usar cookies propias de medición. Desactiva la medición en Preferencias de cookies para detener los próximos envíos y borrar las cookies de medición del sitio. Borrar los datos del sitio también borra la elección.'],
      ['Calculadora y Warp Tracker', 'Los valores de la calculadora quedan en el almacenamiento local. Con permiso de medición, los eventos de interacción omiten esos valores. Warp Tracker guarda el historial en IndexedDB en su origen independiente y funciona sin Analytics ni publicidad. La migración requiere exportar una copia y confirmar la importación.'],
      ['Enlaces externos y contacto', 'Los canales oficiales de canje tratan los datos de cuenta o códigos que introduzcas allí. Las incidencias de GitHub son públicas. Con permiso de medición, los clics comerciales usan el identificador público de la oferta y el tipo de relación, sin enviar la URL de destino ni datos de compra.'],
    ],
    adTitle: 'Publicidad',
    adOff: 'Los anuncios están desactivados. La verificación de AdSense usa una metaetiqueta y ads.txt. El consentimiento de Analytics se aplica a la medición.',
    adOn: 'Cuando Google autorice la publicación de anuncios, AdSense podrá mostrarlos en las páginas elegibles en portugués para visitas identificadas como de Brasil que hayan dado permiso. La consulta regional devuelve solo una decisión de elegibilidad. Puedes retirar el permiso en Preferencias de cookies. Analytics y publicidad tienen controles separados.',
    advertising: [
      'GachaVerse identifica la publicidad, los patrocinios y los enlaces de afiliados. Una relación comercial no determina las conclusiones editoriales. Una compra elegible mediante un enlace de afiliación identificado puede generar compensación para el portal.',
      'Cada oferta se revisa antes de publicarla, incluidos su destino, proveedor y condiciones. Solo describimos una recarga como oficial si el editor confirma la autorización para el juego, el proveedor y la región.',
    ],
    advertise: [
      'Podemos evaluar patrocinios identificados de guías o calendarios, campañas sobre los juegos que cubrimos y ofertas de afiliación identificadas.',
      'Indica el nombre público de la empresa, el juego o tema, el formato y las fechas. Todas las propuestas pasan por revisión. Mantén los datos personales, credenciales y condiciones confidenciales fuera del canal público.',
    ],
    github: 'Abrir el registro público de incidencias de GitHub', contactLink: 'Contactar con GachaVerse', policy: 'Política de publicidad y afiliados',
  },
};

export function InstitutionalContent({ page, locale }: { page: Institution; locale: TranslationLocale }) {
  const c = copy[locale];
  const h = sectionLabels[locale];
  const en = locale === 'en';
  const contact = <Link href={toolPath('contact', locale)}>{c.contactLink}</Link>;
  const policy = <Link href={toolPath('advertising', locale)}>{c.policy}</Link>;
  const configured = autoAdsSource(advertisingPolicy, autoAdsEnabled, adsenseClient);
  const google = <a href={'https://policies.google.com/technologies/partner-sites?hl=' + locale}>{h.google}</a>;
  if (page === 'privacy') {
    const [visit, analytics, , external] = c.privacy;
    return <>
      <h2>{visit[0]}</h2><p>{visit[1]}</p>
      <p><a href="https://www.cloudflare.com/privacypolicy/">{h.cloudflare}</a></p>
      <h2>{analytics[0]}</h2><p>{analytics[1]}</p><p>{google}</p>
      <h2>{h.calculator}</h2><p>{en ? 'Calculator inputs stay in local storage. With measurement permission, the portal records tool opens, calculations, banner changes, and resets. These events omit pity and resource balances.' : 'La calculadora guarda los valores en el almacenamiento local. Con permiso de medición, el portal registra la apertura, el cálculo, el cambio de banner y el reinicio. Los eventos omiten el pity y el saldo.'}</p>
      <h2>{h.tracker}</h2><p>{en ? 'The tracker stores history in IndexedDB on its own origin and works with local files, without audience measurement or advertising. To migrate an older history, export a copy on the portal and confirm the import on the tracker.' : 'El tracker guarda el historial en IndexedDB en su propio origen y funciona con archivos locales, sin medición ni publicidad. Para migrar un historial anterior, exporta una copia en el portal y confirma la importación en el tracker.'}</p>
      <h2>{c.adTitle}</h2><p>{configured ? c.adOn : c.adOff}</p>
      <h2>{external[0]}</h2><p>{external[1]} {policy}.</p>
      <p>{contact}</p>
    </>;
  }
  if (page === 'about') return <>
    <p>{c.about[0]}</p><h2>{h.criteria}</h2><p>{c.about[1]}</p>
    <h2>{h.corrections}</h2><p>{en ? 'Report broken links, expired codes, or outdated instructions with the page and a source.' : 'Indica la página y la fuente al avisar de enlaces rotos, códigos vencidos o instrucciones desactualizadas.'} {contact}.</p>
    <h2>{h.advertising}</h2><p>{en ? 'Advertising placements stay disabled while the portal awaits Google AdSense approval.' : 'Los espacios publicitarios siguen desactivados mientras el portal espera la aprobación de Google AdSense.'}</p>
  </>;
  if (page === 'contact') return <>
    <h2>{h.contact}</h2>
    {c.contact.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
    <p><a href="https://github.com/hrq1408/gachaverse/issues">{c.github}</a></p>
  </>;
  if (page === 'advertise') return <>
    <h2>{h.formats}</h2><ul>{(en ? ['Disclosed sponsorship of guides, calendars, or portal sections.', 'Campaigns for launches and events related to covered games.', 'Disclosed offers and affiliate links with reviewed destinations, providers, and terms.'] :
      ['Patrocinios identificados de guías, calendarios o secciones del portal.', 'Campañas de lanzamientos y eventos de los juegos cubiertos.', 'Ofertas y enlaces de afiliados identificados, con revisión del proveedor, destino y condiciones.']).map(format => <li key={format}>{format}</li>)}</ul>
    <h2>{h.proposal}</h2><p>{c.advertise[1]}</p>
    <p><Link className="button secondary" href={toolPath('contact', locale)}>{c.contactLink}</Link></p>
    <h2>{h.criteria}</h2><p>{c.advertising[0]} {c.advertising[1]}</p>
    <p>{policy}</p>
  </>;
  return <>
    <h2>{h.independence}</h2><p>{c.advertising[0]}</p>
    <h2>{h.affiliate}</h2><p>{en ? 'A disclosed affiliate link may generate a commission. Partners set the prices, payment options, terms, and support.' : 'Un enlace de afiliación identificado puede generar una comisión. El socio fija los precios, las opciones de pago, las condiciones y el soporte.'}</p>
    <h2>{h.offers}</h2><p>{c.advertising[1]}</p>
    <h2>{h.analytics}</h2><p>{en ? 'With measurement permission, the portal uses only the public offer ID, relationship type, and navigation context for commercial click events.' : 'Con permiso de medición, los clics comerciales usan solo el identificador público de la oferta, el tipo de relación y el contexto de navegación.'}</p>
    <p><Link href={toolPath('privacy', locale)}>{en ? 'Privacy policy' : 'Política de privacidad'}</Link> · {contact}</p>
    <p><Link href={toolPath('advertise', locale)}>{en ? 'Advertise on GachaVerse' : 'Anúnciate en GachaVerse'}</Link></p>
  </>;
}
