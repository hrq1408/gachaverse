'use client';

import Link from 'next/link';
import { Copy, ExternalLink, Gift } from 'lucide-react';
import { useEffect, useState } from 'react';
import { games, gamePath, type Game } from '@/content/catalog';
import { trackAction } from '@/lib/analytics';
import type { RedemptionCode } from '@/content/redemption';
import { codeStatus, confirmedTimeLeft, isRecent } from '@/lib/redemption-status';
import { copyRedemptionCode } from './copy-redemption-code';
import type { Locale } from '@/i18n/locales';
import { redemptionCopy } from '@/i18n/redemption';
import { localizedCodeNote, localizedReward } from '@/i18n/catalog-copy';
import { toolPath } from '@/i18n/tools';

const central = '/conteudo/codigos/';
const pageFor = (game: Game) => gamePath(game) + 'codigos/';
const statuses = {
  'pt-BR': { 'no-prazo': 'Dentro do prazo', 'sem-prazo': 'Sem prazo informado', expirado: 'Expirado', revisao: 'Revisão pendente' },
  en: { 'no-prazo': 'Within deadline', 'sem-prazo': 'No published deadline', expirado: 'Expired', revisao: 'Review pending' },
  es: { 'no-prazo': 'Dentro del plazo', 'sem-prazo': 'Sin plazo publicado', expirado: 'Vencido', revisao: 'Revisión pendiente' },
};
const steps: Record<Game['slug'], string> = {
  'honkai-star-rail': 'Entre na sua conta HoYoverse, selecione o servidor, confira o personagem e cole o código no site oficial. Depois, abra o correio do jogo.',
  'genshin-impact': 'Entre na sua conta HoYoverse, escolha o servidor e confira o apelido antes de colar o código. Recolha a recompensa no correio do jogo.',
  'zenless-zone-zero': 'Conclua a missão do prólogo que libera o resgate. No site oficial, entre na sua conta e selecione o servidor. No jogo, use Menu, Mais e Código de resgate.',
  'wuthering-waves': 'Dentro do jogo, abra Configurações, Outros e Código de resgate. Digite o código, confirme e confira o correio.',
};

const localizedSteps = {
  'pt-BR': steps,
  en: {
    'honkai-star-rail': 'Sign in to your HoYoverse Account, choose your server, confirm your character, and paste the code on the official site. Check your in-game mail.',
    'genshin-impact': 'Sign in to your HoYoverse Account, choose your server, and check your nickname. Paste the code and claim the reward from in-game mail.',
    'zenless-zone-zero': 'Finish the prologue mission that unlocks redemption. Sign in and choose your server on the official site, or use Menu, More, and Redemption Code in the game.',
    'wuthering-waves': 'In the game, open Settings, Other, and Redemption Code. Enter the code, confirm, and check your mail.',
  },
  es: {
    'honkai-star-rail': 'Inicia sesión en HoYoverse, elige el servidor, comprueba el personaje e introduce el código en el sitio oficial. Revisa el correo del juego.',
    'genshin-impact': 'Inicia sesión en HoYoverse, elige el servidor y verifica tu nombre. Introduce el código y recoge la recompensa en el correo del juego.',
    'zenless-zone-zero': 'Completa la misión del prólogo que desbloquea el canje. Inicia sesión y elige el servidor en el sitio oficial, o usa las opciones de canje del menú del juego.',
    'wuthering-waves': 'Dentro del juego, abre los ajustes y busca la opción de canje en la sección de otras opciones. Introduce el código y revisa el correo.',
  },
};

export function RedemptionCenter({ entries, game, snapshot, locale = 'pt-BR' }: {
  entries: RedemptionCode[]; game?: Game; snapshot: number; locale?: Locale;
}) {
  const c = redemptionCopy[locale];
  const labels = statuses[locale];
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeZone: 'UTC' });
  const deadline = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });
  const [gameFilter, setGameFilter] = useState<Game['slug'] | ''>(game?.slug ?? '');
  const [statusFilter, setStatusFilter] = useState('disponiveis');
  const [now, setNow] = useState(snapshot);
  const [notice, setNotice] = useState('');
  const [used, setUsed] = useState<string[]>([]);
  const [hideUsed, setHideUsed] = useState(false);
  const storageKey = 'gachaverse:redemption:v1';
  const codeKey = (entry: RedemptionCode) => entry.game + ':' + entry.code.toUpperCase();
  useEffect(() => {
    function refresh() { setNow(Date.now()); }
    function sync() {
      try {
        const stored = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
        setUsed(Array.isArray(stored.used) ? stored.used.filter((key: unknown) => typeof key === 'string') : []);
        setHideUsed(stored.hide === true);
      } catch { /* Keep local preferences for this visit. */ }
    }
    refresh();
    sync();
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const listed = entries.map(entry => ({ entry, status: codeStatus(entry, now) }))
    .filter(({ entry, status }) => (!gameFilter || entry.game === gameFilter) && (!hideUsed || !used.includes(codeKey(entry))) &&
      (statusFilter === 'todos' || statusFilter === status ||
        (statusFilter === 'disponiveis' && (status === 'no-prazo' || status === 'sem-prazo'))))
    .sort((a, b) => (confirmedTimeLeft(a.entry, now) || Infinity) - (confirmedTimeLeft(b.entry, now) || Infinity) ||
      (b.entry.publishedOn ?? '').localeCompare(a.entry.publishedOn ?? ''));
  const displayGames = game ? [game] : games.filter(item => !gameFilter || item.slug === gameFilter);

  async function copy(entry: RedemptionCode) {
    try {
      await copyRedemptionCode(entry);
      setNotice(c.copied + ': ' + entry.code);
    } catch {
      setNotice(c.copyError);
    }
  }

  function savePreferences(next: string[], hide: boolean) {
    setUsed(next);
    setHideUsed(hide);
    try { localStorage.setItem(storageKey, JSON.stringify({ used: next, hide })); }
    catch { setNotice(c.saveError); }
  }

  return <div className="redemption-center">
    <nav aria-label={c.nav} className="redemption-games">
      {game && <Link className="button secondary" href={locale === 'pt-BR' ? central : toolPath('codes', locale)}>{c.all}</Link>}
      {games.map(item => <Link className="button secondary" key={item.slug}
        aria-current={item.slug === game?.slug ? 'page' : undefined} href={locale === 'pt-BR' ? pageFor(item) : toolPath('codes', locale) + item.slug + '/'}
        onClick={() => trackAction('redemption_game_select', { game_slug: item.slug })}>
        <Gift size={16} aria-hidden="true" />{item.name}</Link>)}
    </nav>
    <section className="panel redemption-filters" aria-label={c.filters}>
      {!game && <div><label htmlFor="redemption-game-filter">{c.game}</label><select id="redemption-game-filter" value={gameFilter} onChange={event => {
        const selected = games.find(item => item.slug === event.target.value);
        setGameFilter(selected?.slug ?? '');
        if (selected) trackAction('redemption_game_select', { game_slug: selected.slug });
      }}>
        <option value="">{c.all}</option>
        {games.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}
      </select></div>}
      <div><label htmlFor="redemption-status-filter">{c.available}</label><select id="redemption-status-filter" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
        <option value="disponiveis">{c.try}</option>
        <option value="todos">{c.records}</option>
        {Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select></div>
      <label className="redemption-hide-used"><input type="checkbox" checked={hideUsed}
        onChange={event => savePreferences(used, event.target.checked)} /> {c.hide}</label>
      <p role="status">{listed.length} {listed.length === 1 ? c.single : c.multiple}</p>
    </section>
    <p className="redemption-note">{c.note}</p>
    <p role="status" className="redemption-notice">{notice}</p>
    {displayGames.map(item => {
      const codes = listed.filter(({ entry }) => entry.game === item.slug);
      return <section className="redemption-group" key={item.slug} aria-labelledby={'resgate-' + item.slug}>
        <div className="redemption-instructions">
          <h2 id={'resgate-' + item.slug}>{item.name}</h2>
          <p>{localizedSteps[locale][item.slug]}</p>
          <a className="button secondary" data-game={item.slug} data-redemption="" href={item.redemption}>
            {item.slug === 'wuthering-waves' ? c.instructions : c.official} <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
        {codes.length === 0 ? <p className="panel">{c.empty}</p> :
          <ul className="redemption-list">{codes.map(({ entry, status }) => {
            const remaining = confirmedTimeLeft(entry, now);
            const marked = used.includes(codeKey(entry));
            const redeemable = status === 'no-prazo' || status === 'sem-prazo';
            const redemptionUrl = new URL(item.redemption);
            redemptionUrl.searchParams.set('code', entry.code);
            return <li className="redemption-record" key={entry.code}>
            <div className="redemption-record-head">
              <code>{entry.code}</code><span className="redemption-state" data-status={status}>{labels[status]}</span>
            </div>
            {((status !== 'expirado' && isRecent(entry, now)) || (remaining !== null && remaining > 0 && remaining <= 48 * 3600000)) &&
              <p className="redemption-highlight">{remaining !== null && remaining > 0 && remaining <= 48 * 3600000 ? c.expiring : c.recent}</p>}
            <p><strong>{c.rewards}</strong><br />{entry.rewards.map((reward, index) => {
              const label = localizedReward(reward, locale);
              return <span key={reward}>{index > 0 && ' · '}<span lang={label.lang}>{label.text}</span></span>;
            })}</p>
            <p>{entry.expiresAt ? <>{c.deadline}: <time dateTime={entry.expiresAt}>{deadline.format(Date.parse(entry.expiresAt))} (Brasília)</time></>
              : c.unknown}</p>
            {remaining !== null && remaining > 0 && <p>{c.remaining}: {Math.floor(remaining / 3600000)} h {Math.floor(remaining / 60000) % 60} min {Math.floor(remaining / 1000) % 60} s</p>}
            {entry.editorialNote && <p>{c.editorialNote}: <span lang={localizedCodeNote(entry.editorialNote, locale).lang}>{localizedCodeNote(entry.editorialNote, locale).text}</span></p>}
            <p>{c.checked}: <time dateTime={entry.verifiedOn}>{date.format(Date.parse(entry.verifiedOn))}</time></p>
            <ul className="redemption-sources" aria-label={c.sources}>{entry.sources.map(source => <li key={source.url}>
              <a href={source.url} lang="pt-BR">{source.title}</a> <span lang="pt-BR">({source.type})</span>
            </li>)}</ul>
            <div className="redemption-actions">
              {redeemable && <button type="button" className="button primary" onClick={() => void copy(entry)} aria-label={c.copy + ' ' + entry.code}>
                <Copy size={16} aria-hidden="true" />{c.copyCode}
              </button>}
              {redeemable && item.slug !== 'wuthering-waves' && <a className="button secondary"
                href={redemptionUrl.href} target="_blank" rel="noreferrer" data-game={item.slug} data-redemption=""
                onClick={() => void copy(entry)}>{c.copyAndRedeem} <ExternalLink size={15} aria-hidden="true" /></a>}
              <label><input type="checkbox" checked={marked} onChange={() => savePreferences(
                marked ? used.filter(key => key !== codeKey(entry)) : [...used, codeKey(entry)], hideUsed
              )} /> {c.used}</label>
            </div>
          </li>;
          })}</ul>}
      </section>;
    })}
    <Link className="back-link" href="/artigos/onde-resgatar-codigos/" hrefLang="pt-BR">{c.guide}</Link>
  </div>;
}
