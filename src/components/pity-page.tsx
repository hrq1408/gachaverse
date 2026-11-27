import { AdSlot } from '@/features/advertising/components';
import Link from 'next/link';
import { Suspense } from 'react';
import { Calculator, CalculatorForm } from '@/features/pity/components/calculator';
import { starRail } from '@/features/pity/config/games';
import type { Locale } from '@/i18n/locales';
import { localizedArticlePath, toolsDirectoryPath } from '@/i18n/visual-content';

const copy = {
  "pt-BR": {
    "back": "Ferramentas",
    "title": "Calculadora de",
    "intro": "Veja quantos Saltos sua reserva cobre e quanto falta para garantir o destaque do banner.",
    "usage": "Como utilizar",
    "instructions": "Escolha o tipo de banner e conte, no histórico correspondente, os Saltos feitos desde o último cinco estrelas. Se ainda não recebeu nenhum, conte desde o primeiro Salto. Informe suas Jades e apenas os Passes Especiais. Cada banner guarda um cenário separado neste navegador.",
    "guarantee": "O que o pity garante?",
    "rules": "Um cinco estrelas reinicia o contador. O limite é de 90 Saltos no evento convencional de personagem e de 80 no de Cone de Luz. Se o último cinco estrelas desse tipo de evento veio fora do destaque e sua garantia continua ativa, marque a opção correspondente. Assim, basta reservar recursos para um ciclo. Sem essa garantia, o planejamento cobre também um segundo ciclo completo.",
    "examples": "Exemplos de cálculo",
    "example1": "Com pity 70 em personagem e garantia ativa, faltam no máximo 20 Saltos. Com 2 Passes Especiais e 2.879 Jades, você já cobre 19. Uma Jade a mais completa o vigésimo Salto.",
    "example2": "Em um banner de Cone de Luz, pity 79 deixa apenas um Salto até o próximo cinco estrelas. Sem garantia promocional ativa, o teto para obter o destaque ainda é de 81 Saltos.",
    "limits": "Limites e fontes",
    "limitsText": "A barra mede a parte do orçamento já coberta. O destaque pode chegar antes do limite. O cálculo usa 160 Jades por Salto e abrange apenas eventos promocionais convencionais. Confira as regras na tela de detalhes antes de gastar passes.",
    "checked": "Regras conferidas em",
    "source1": "HoYoverse — limites por tipo de Salto",
    "source2": "HoYoverse — garantia dos Cones de Luz",
    "source3": "HoYoLAB — exemplo de regras de um evento de personagem",
    "related": "Guias relacionados",
    "guide1": "Como funcionam o pity e o 50/50",
    "guide2": "Como conseguir Jades Estelares",
    "guide3": "Como planejar banners sendo F2P"
  },
  "en": {
    "back": "Tools",
    "title": "Pity calculator",
    "intro": "See how many Warps your reserve covers and what you still need to guarantee the featured result.",
    "usage": "How to use it",
    "instructions": "Choose the banner type and count the Warps since your last 5-star in its history. If you have never received one, count from your first Warp. Enter your Stellar Jade and only your Star Rail Special Passes. Each banner stores a separate plan in this browser.",
    "guarantee": "What does pity guarantee?",
    "rules": "A 5-star resets the counter. Conventional Character Event Warps have a limit of 90, and Light Cone Event Warps have a limit of 80. If your last 5-star of this type was not featured and your guarantee still applies, select the guarantee option. Budget for one cycle with the guarantee, or for an additional full cycle without it.",
    "examples": "Calculation examples",
    "example1": "With 70 pity and an active character guarantee, you need at most 20 Warps. Two Star Rail Special Passes and 2,879 Stellar Jade cover 19. One more Jade covers the twentieth Warp.",
    "example2": "On a Light Cone Event Warp, 79 pity leaves one Warp until the next 5-star at most. Without an active featured guarantee, the featured Light Cone can still take up to 81 Warps.",
    "limits": "Limits and sources",
    "limitsText": "The bar shows how much of the budget is covered. The featured result can arrive earlier. The calculation uses 160 Stellar Jade per Warp and applies to conventional event banners. Check the details in-game before spending.",
    "checked": "Rules verified on",
    "source1": "HoYoverse — limits by Warp type",
    "source2": "HoYoverse — the Light Cone guarantee",
    "source3": "HoYoLAB — example Character Event Warp rules",
    "related": "Related guides",
    "guide1": "How pity and the 50/50 work",
    "guide2": "How to get Stellar Jade",
    "guide3": "How to plan banners as a free-to-play player"
  },
  "es": {
    "back": "Herramientas",
    "title": "Calculadora de",
    "intro": "Consulta cuántos Saltos cubren tus recursos y cuánto falta para garantizar el resultado destacado.",
    "usage": "Cómo usarla",
    "instructions": "Elige el tipo de banner y cuenta los Saltos desde el último cinco estrellas en su historial. Si todavía no recibiste ninguno, cuenta desde el primer Salto. Introduce el Jade estelar y solo los Pases especiales de los raíles estelares. Cada tipo guarda un plan separado en este navegador.",
    "guarantee": "¿Qué garantiza el pity?",
    "rules": "Un cinco estrellas reinicia el contador. El límite convencional es de 90 Saltos para el personaje y 80 para el cono de luz. Si tu último cinco estrellas en ese tipo de evento no era el destacado y la garantía sigue activa, marca la opción. Con garantía, reserva recursos para un ciclo. Sin ella, calcula un ciclo completo adicional.",
    "examples": "Ejemplos de cálculo",
    "example1": "Con 70 de pity y la garantía de personaje activa, faltan como máximo 20 Saltos. Dos pases especiales y 2879 de Jade estelar cubren 19. Una unidad más de jade cubre el vigésimo Salto.",
    "example2": "En un Salto promocional de cono de luz, un pity de 79 deja como máximo un Salto hasta el siguiente cinco estrellas. Sin garantía activa, el cono destacado puede requerir hasta 81 Saltos.",
    "limits": "Límites y fuentes",
    "limitsText": "La barra muestra la parte del presupuesto que ya tienes cubierta. El destacado puede llegar antes. La calculadora usa 160 de Jade estelar por Salto y se aplica a eventos promocionales convencionales. Consulta los detalles en el juego antes de gastar.",
    "checked": "Reglas comprobadas el",
    "source1": "HoYoverse — límites por tipo de Salto",
    "source2": "HoYoverse — garantía de los conos de luz",
    "source3": "HoYoLAB — ejemplo de reglas de un Salto de personaje",
    "related": "Guías relacionadas",
    "guide1": "Cómo funcionan el pity y el 50/50",
    "guide2": "Cómo conseguir Jade estelar",
    "guide3": "Cómo planificar los banners sin gastar dinero"
  }
} as const;

const terms = {
  en: { currency: 'Stellar Jades', currencySingular: 'Stellar Jade', tickets: 'Star Rail Special Passes', character: 'Character', cone: 'Light Cone' },
  es: { currency: 'Jade estelar', currencySingular: 'Jade estelar', tickets: 'Pases especiales de los raíles estelares', character: 'Personaje', cone: 'Cono de luz' },
} as const;

export function PityPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' });
  const translated = locale === 'pt-BR' ? null : terms[locale];
  const rules = !translated ? starRail : { ...starRail, currency: translated.currency, currencySingular: translated.currencySingular,
    tickets: translated.tickets, banners: starRail.banners.map(banner => ({ ...banner, label: banner.id === 'cone' ? translated.cone : translated.character })) };
  return <div className="shell interior pity-page">
    <header className="page-heading"><Link className="back-link" href={toolsDirectoryPath(locale)}>{c.back}</Link>
      <p className="eyebrow mt-5">Honkai: Star Rail</p><h1>{locale === "en" ? <><em>Pity</em> calculator</> : <>{c.title} <em>pity</em></>}</h1>
      <p className="intro">{c.intro}</p></header>
    <Suspense fallback={<CalculatorForm game={rules} locale={locale} />}><Calculator game={rules} locale={locale}/></Suspense>
    <section className="prose pity-guide"><h2>{c.usage}</h2>
      <p>{c.instructions}</p>
      <h2>{c.guarantee}</h2><p>{c.rules}</p>
      <h2>{c.examples}</h2><p>{c.example1}</p>
      <p>{c.example2}</p>
      {locale === 'pt-BR' && <AdSlot placement="calculatorGuide"/>}
      <h2>{c.limits}</h2><p>{c.limitsText}</p>
      <p>{c.checked} <time dateTime="2026-11-25">{date.format(new Date('2026-11-25'))}</time>.</p>
      <ul><li><a href="https://support.hoyoverse.com/hc/en-us/articles/50913710696217-How-does-the-pity-system-work-for-different-banners-and-reruns">{c.source1}</a></li>
      <li><a href="https://support.hoyoverse.com/hc/en-us/articles/50913708153625-How-does-the-guarantee-system-work-for-the-Light-Cone-Event-Warp-and-does-my-pity-carry-over">{c.source2}</a></li>
      <li><a href="https://www.hoyolab.com/article/45275874">{c.source3}</a></li></ul>
      <h2>{c.related}</h2><ul><li><Link href={localizedArticlePath('honkai-star-rail-pity-50-50', locale)}>{c.guide1}</Link></li><li><Link href={localizedArticlePath('honkai-star-rail-jades-estelares', locale)}>{c.guide2}</Link></li><li><Link href={localizedArticlePath('honkai-star-rail-planejar-banners-f2p', locale)}>{c.guide3}</Link></li></ul>
    </section></div>;
}
