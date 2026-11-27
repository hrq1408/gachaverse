import { Suspense } from 'react';
import Link from 'next/link';
import { ArticleSearch } from '@/components/article-search';
import { BannerCalendar } from '@/components/banner-calendar';
import { RedemptionCenter } from '@/components/redemption-center';
import { banners, bannerAnnouncements } from '@/content/banners';
import { games, type Game } from '@/content/catalog';
import { redemptionCodes, redemptionSnapshot } from '@/content/redemption';
import { Calculator, CalculatorForm } from '@/features/pity/components/calculator';
import { starRail } from '@/features/pity/config/games';
import { publishedTranslations, translationPath } from './articles';
import { InstitutionalContent } from './institutional';
import type { TranslationLocale } from './locales';
import { toolTitles, type ToolPage } from './tools';

const pity = {
  en: {
    resources: ['Stellar Jades', 'Stellar Jade', 'Star Rail Special Passes'],
    banners: { personagem: 'Character', cone: 'Light Cone' },
    title: 'How the calculator works',
    body: 'Select your banner and count Warps since the last 5-star on that banner type. If you have not received a 5-star, count from your first Warp. Enter your Stellar Jades and Star Rail Special Passes. Each banner has its own plan in this browser.',
    limit: 'Conventional character and Light Cone Event Warps have limits of 90 and 80 respectively. Getting a 5-star resets the counter. If a previous 5-star was not featured and that guarantee is active, turn on the guarantee. The calculator budgets for the worst case and uses 160 Stellar Jades per Warp. Check the in-game details before spending passes.',
    source: 'HoYoverse Help Center — pity and banner rules', announcement: 'Publisher announcements', loading: 'Loading search…',
  },
  es: {
    resources: ['Jades estelares', 'Jade estelar', 'Pases especiales de los raíles estelares'],
    banners: { personagem: 'Personaje', cone: 'Cono de luz' },
    title: 'Cómo funciona la calculadora',
    body: 'Elige el tipo de banner y cuenta los saltos desde el último cinco estrellas de ese tipo. Si aún no has obtenido ninguno, cuenta desde el primer salto. Introduce el Jade estelar y los Pases especiales de los raíles estelares. Cada tipo de banner guarda un plan separado en este navegador.',
    limit: 'Los Saltos promocionales convencionales de personaje y cono de luz tienen límites de 90 y 80 respectivamente. Obtener un cinco estrellas reinicia el contador. Si el anterior no era el destacado y sigue activa la garantía, marca esa opción. Se calcula el peor caso con 160 Jades estelares por salto. Consulta las reglas del juego antes de gastar pases.',
    source: 'Centro de ayuda de HoYoverse — pity y reglas de los banners', announcement: 'Anuncios de los editores', loading: 'Cargando búsqueda…',
  },
} as const;

const announcementCopy = {
  en: {
    title: 'Zenless Zone Zero 3.4 — The Finality of the Day',
    highlights: ['Sunbringer debuts as the first Enchainer Agent.', 'Robin, the S-Rank crossover Agent, is a login reward during the event.', 'Kafka joins limited-time Signal Search after January 1.'],
    note: 'The publisher announcement does not specify the opening and closing times of these channels by server.',
    source: 'https://zenless.hoyoverse.com/en-us/news/167400',
  },
  es: {
    title: 'Zenless Zone Zero 3.4 — Los últimos vestigios del día',
    highlights: ['Debuta la Dama del Albor, la primera agente encadenadora.', 'Robin, la agente de grado S de la colaboración, se obtiene al iniciar sesión durante el evento.', 'Kafka se incorpora a la sintonización por tiempo limitado a partir del 1 de enero.'],
    note: 'El comunicado oficial no especifica las horas de apertura y cierre de estas sintonizaciones por servidor.',
    source: 'https://zenless.hoyoverse.com/m/es-es/news/167400',
  },
} as const;

export function ToolContent({ page, locale, game }: { page: ToolPage; locale: TranslationLocale; game?: Game }) {
  const [title, description] = toolTitles[locale][page];
  const c = pity[locale];
  const entries = publishedTranslations.filter(row => row.locale === locale);
  const translatedRules = { ...starRail, currency: c.resources[0], currencySingular: c.resources[1], tickets: c.resources[2],
    banners: starRail.banners.map(banner => ({ ...banner, label: banner.id === 'cone' ? c.banners.cone : c.banners.personagem })) };

  let body;
  switch (page) {
    case 'codes':
      body = <RedemptionCenter locale={locale} entries={game ? redemptionCodes.filter(entry => entry.game === game.slug) : redemptionCodes} game={game} snapshot={redemptionSnapshot} />;
      break;
    case 'calendar':
      body = <><BannerCalendar locale={locale} entries={banners} snapshot={redemptionSnapshot} />
        <section><h2>{c.announcement}</h2>{bannerAnnouncements.map(item => {
          const copy = item.game === 'zenless-zone-zero' && item.version === '3.4' ? announcementCopy[locale] : undefined;
          return <article className="panel" key={item.source} lang={copy ? locale : 'pt-BR'}>
            <h3><a href={copy?.source ?? item.source}>{copy?.title ?? item.title}</a></h3>
            <ul>{(copy?.highlights ?? item.highlights).map(point => <li key={point}>{point}</li>)}</ul>
            <p>{copy?.note ?? item.scheduleNote}</p>
          </article>;
        })}</section></>;
      break;
    case 'pity':
      body = <><Suspense fallback={<CalculatorForm game={translatedRules} locale={locale} />}><Calculator game={translatedRules} locale={locale} /></Suspense>
        <section className="prose pity-guide"><h2>{c.title}</h2><p>{c.body}</p><p>{c.limit}</p>
          <a href="https://support.hoyoverse.com/hc/en-us/articles/50913710696217-How-does-the-pity-system-work-for-different-banners-and-reruns">{c.source}</a>
        </section></>;
      break;
    case 'search':
      body = <Suspense fallback={<p>{c.loading}</p>}><ArticleSearch locale={locale} terms={entries.map(entry =>
        [entry.article.titulo, entry.article.descricao, ...games.filter(item => entry.article.jogos.includes(item.slug)).map(item => item.name)].join(' '))}>
        {entries.map(entry => <article className="panel" key={entry.slug}><h2><Link href={translationPath(entry)}>{entry.article.titulo}</Link></h2><p>{entry.article.descricao}</p></article>)}
      </ArticleSearch></Suspense>;
      break;
    default:
      body = <article className="prose"><InstitutionalContent page={page} locale={locale} /></article>;
  }
  return <div className={'shell interior' + (page === 'pity' ? ' pity-page' : '')}><header className="page-heading">
    <h1>{game ? game.name + ' — ' + title : title}</h1><p>{description}</p>
  </header>{body}</div>;
}
