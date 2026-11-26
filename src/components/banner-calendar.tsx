'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { games, sectionPath, sections } from '@/content/catalog';
import { bannersCheckedOn, bannerStatus, type Banner } from '@/content/banners';

const calendar = sections.find(section => section.slug === 'calendario')!;
const labels = { personagem: 'Personagens', equipamento: 'Equipamentos', tematico: 'Banner temático' };

function subscribe(listener: () => void) {
  const timer = setInterval(listener, 60_000);
  window.addEventListener('focus', listener);
  return () => { clearInterval(timer); window.removeEventListener('focus', listener); };
}

function formatDate(date: string) {
  return date.split('-').reverse().join('/');
}

export function BannerCalendar({ entries, snapshot, home = false }: { entries: Banner[]; snapshot: number; home?: boolean }) {
  const now = useSyncExternalStore(subscribe, () => Math.floor(Date.now() / 60_000) * 60_000, () => snapshot);
  const listed = home
    ? games.flatMap(game => entries.filter(row => row.game === game.slug && bannerStatus(row, now) === 'Em andamento').slice(0, 1))
    : [...entries].sort((a, b) => Number(bannerStatus(a, now) === 'Em andamento') - Number(bannerStatus(b, now) === 'Em andamento') || a.end.localeCompare(b.end));
  if (!listed.length) return null;

  return <section aria-labelledby="confirmed-banners">
    <div className="section-heading"><h2 id="confirmed-banners">{home ? 'Banners em destaque' : 'Banners confirmados'}</h2>
      {home ? <Link href={sectionPath(calendar)}>Ver calendário</Link>
        : <span>Fontes conferidas em <time dateTime={bannersCheckedOn}>{formatDate(bannersCheckedOn)}</time></span>}
    </div>
    {!home && <nav className="mb-4" aria-label="Calendário por jogo">
      {new Set(entries.map(row => row.game)).size > 1
        ? games.map(game => <Link key={game.slug} href={sectionPath(calendar, game)}>{game.name}</Link>)
        : <Link href={sectionPath(calendar)}>Calendário dos quatro jogos</Link>}
    </nav>}
    <div className="card-grid">{listed.map(banner => {
      const game = games.find(item => item.slug === banner.game)!;
      const status = bannerStatus(banner, now);
      return <article key={banner.id} className="panel banner-record">
        <p className="eyebrow">{game.name} · {banner.version}</p>
        <h3>{banner.highlights.join(' · ')}</h3>
        <p>{labels[banner.kind]} · <strong>{status}</strong></p>
        {!home && <p>{banner.startTime
          ? <>De <time dateTime={banner.start}>{formatDate(banner.start)}</time> às {banner.startTime}</>
          : <>Após a atualização de <time dateTime={banner.start}>{formatDate(banner.start)}</time></>}
          {' até '}<time dateTime={banner.end}>{formatDate(banner.end)}</time> às {banner.endTime}.</p>}
        {home ? <p><Link href={sectionPath(calendar, game)}>Ver datas e fontes</Link></p> : <p><a href={banner.source}>Anúncio oficial</a></p>}
        {banner.pityFamily && status !== 'Encerrado' && <p><Link href={'/ferramentas/calculadora-pity/?banner=' + banner.pityFamily + '#planejamento'}>Planejar na calculadora</Link></p>}
      </article>;
    })}</div>
    {!home && <p className="mt-4">Os horários seguem o anúncio de cada jogo. Consulte a tela do banner para confirmar a vigência no seu servidor.</p>}
  </section>;
}
