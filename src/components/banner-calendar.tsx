'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { games, sectionPath, sections } from '@/content/catalog';
import { bannersCheckedOn, bannerStatus, type Banner } from '@/content/banners';
import type { Locale } from '@/i18n/locales';
import { localizedBannerName } from '@/i18n/catalog-copy';
import { toolPath } from '@/i18n/tools';

const calendar = sections.find(section => section.slug === 'calendario')!;
const copy = {
  'pt-BR': ['Banners em destaque', 'Banners confirmados', 'Ver calendário', 'Fontes conferidas em', 'Calendário por jogo', 'Calendário dos quatro jogos', 'De', 'às', 'Após a atualização de', 'até', 'Ver datas e fontes', 'Anúncio oficial', 'Planejar na calculadora', 'Os horários seguem o anúncio de cada jogo. Consulte a tela do banner para confirmar a vigência no seu servidor.'],
  en: ['Featured banners', 'Confirmed banners', 'See calendar', 'Sources checked on', 'Calendar by game', 'Calendar for all four games', 'From', 'at', 'After the update on', 'until', 'Dates and sources', 'Official announcement', 'Plan in the calculator', 'Dates follow the publisher announcements. Check the in-game banner to confirm the window for your server.'],
  es: ['Banners destacados', 'Banners confirmados', 'Ver calendario', 'Fuentes revisadas el', 'Calendario por juego', 'Calendario de los cuatro juegos', 'Desde', 'a las', 'Tras la actualización del', 'hasta', 'Fechas y fuentes', 'Anuncio oficial', 'Planificar en la calculadora', 'Los horarios proceden de los anuncios. Comprueba las fechas de tu servidor en la pantalla del banner.'],
} as const;
const labels = {
  'pt-BR': { personagem: 'Personagens', equipamento: 'Equipamentos', tematico: 'Banner temático', 'Em andamento': 'Em andamento', Encerrado: 'Encerrado', Programado: 'Programado', 'Confira no servidor': 'Confira no servidor' },
  en: { personagem: 'Characters', equipamento: 'Equipment', tematico: 'Themed banner', 'Em andamento': 'Live', Encerrado: 'Ended', Programado: 'Scheduled', 'Confira no servidor': 'Check your server' },
  es: { personagem: 'Personajes', equipamento: 'Equipamiento', tematico: 'Banner temático', 'Em andamento': 'En curso', Encerrado: 'Finalizado', Programado: 'Programado', 'Confira no servidor': 'Consulta tu servidor' },
};

function subscribe(listener: () => void) {
  const timer = setInterval(listener, 60_000);
  window.addEventListener('focus', listener);
  return () => { clearInterval(timer); window.removeEventListener('focus', listener); };
}

export function BannerCalendar({ entries, snapshot, home = false, locale = 'pt-BR' }: { entries: Banner[]; snapshot: number; home?: boolean; locale?: Locale }) {
  const [featured, confirmed, see, checked, byGame, all, from, at, after, until, dates, official, plan, note] = copy[locale];
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeZone: 'UTC' });
  const formatDate = (date: string) => locale === 'pt-BR' ? date.split('-').reverse().join('/') : dateFormat.format(new Date(date));
  const index = toolPath('calendar', locale);
  const now = useSyncExternalStore(subscribe, () => Math.floor(Date.now() / 60_000) * 60_000, () => snapshot);
  const listed = home
    ? games.flatMap(game => entries.filter(row => row.game === game.slug && bannerStatus(row, now) === 'Em andamento').slice(0, 1))
    : [...entries].sort((a, b) => Number(bannerStatus(a, now) === 'Em andamento') - Number(bannerStatus(b, now) === 'Em andamento') || a.end.localeCompare(b.end));
  if (!listed.length) return null;

  return <section aria-labelledby="confirmed-banners">
    <div className="section-heading"><h2 id="confirmed-banners">{home ? featured : confirmed}</h2>
      {home ? <Link href={index}>{see}</Link>
        : <span>{checked} <time dateTime={bannersCheckedOn}>{formatDate(bannersCheckedOn)}</time></span>}
    </div>
    {!home && <nav className="mb-4" aria-label={byGame}>
      {new Set(entries.map(row => row.game)).size > 1
        ? games.map(game => <Link key={game.slug} href={locale === 'pt-BR' ? sectionPath(calendar, game) : index + '#' + game.slug}>{game.name}</Link>)
        : <Link href={index}>{all}</Link>}
    </nav>}
    <div className="card-grid">{listed.map(banner => {
      const game = games.find(item => item.slug === banner.game)!;
      const status = bannerStatus(banner, now);
      return <article key={banner.id} id={locale !== 'pt-BR' && listed.find(item => item.game === banner.game) === banner ? banner.game : undefined} className="panel banner-record">
        <p className="eyebrow">{game.name} · {banner.version}</p>
        <h3>{banner.highlights.map(name => localizedBannerName(name, locale)).join(' · ')}</h3>
        <p>{labels[locale][banner.kind]} · <strong>{labels[locale][status]}</strong></p>
        {!home && <p>{banner.startTime
          ? <>{from} <time dateTime={banner.start}>{formatDate(banner.start)}</time> {at} {banner.startTime}</>
          : <>{after} <time dateTime={banner.start}>{formatDate(banner.start)}</time></>}
          {' ' + until + ' '}<time dateTime={banner.end}>{formatDate(banner.end)}</time> {at} {banner.endTime}.</p>}
        {home ? <p><Link href={locale === 'pt-BR' ? sectionPath(calendar, game) : index + '#' + game.slug}>{dates}</Link></p> : <p><a href={banner.source}>{official}</a></p>}
        {banner.pityFamily && status !== 'Encerrado' && <p><Link href={toolPath('pity', locale) + '?banner=' + banner.pityFamily + '#planejamento'}>{plan}</Link></p>}
      </article>;
    })}</div>
    {!home && <p className="mt-4">{note}</p>}
  </section>;
}
