'use client';

import Link from 'next/link';
import { Copy, ExternalLink, Gift } from 'lucide-react';
import { useEffect, useState } from 'react';
import { games, gamePath, type Game } from '@/content/catalog';
import { trackAction } from '@/lib/analytics';
import type { RedemptionCode } from '@/content/redemption';
import { codeStatus, confirmedTimeLeft, isRecent } from '@/lib/redemption-status';
import { copyRedemptionCode } from './copy-redemption-code';

const central = '/conteudo/codigos/';
const pageFor = (game: Game) => gamePath(game) + 'codigos/';
const labels = {
  'no-prazo': 'Dentro do prazo',
  'sem-prazo': 'Sem prazo informado',
  'expirado': 'Expirado',
  'revisao': 'Revisão pendente',
};
const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' });
const deadline = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });
const steps: Record<Game['slug'], string> = {
  'honkai-star-rail': 'Entre na sua conta HoYoverse, selecione o servidor, confira o personagem e cole o código no site oficial. Depois, abra o correio do jogo.',
  'genshin-impact': 'Entre na sua conta HoYoverse, escolha o servidor e confira o apelido antes de colar o código. Recolha a recompensa no correio do jogo.',
  'zenless-zone-zero': 'Conclua a missão do prólogo que libera o resgate. No site oficial, entre na sua conta e selecione o servidor. No jogo, use Menu, Mais e Código de resgate.',
  'wuthering-waves': 'Dentro do jogo, abra Configurações, Outros e Código de resgate. Digite o código, confirme e confira o correio.',
};

export function RedemptionCenter({ entries, game, snapshot }: {
  entries: RedemptionCode[]; game?: Game; snapshot: number;
}) {
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
      setNotice('Código copiado: ' + entry.code);
    } catch {
      setNotice('Não foi possível copiar. Selecione o código e copie manualmente.');
    }
  }

  function savePreferences(next: string[], hide: boolean) {
    setUsed(next);
    setHideUsed(hide);
    try { localStorage.setItem(storageKey, JSON.stringify({ used: next, hide })); }
    catch { setNotice('As preferências ficaram disponíveis somente nesta visita.'); }
  }

  return <div className="redemption-center">
    <nav aria-label="Páginas de resgate por jogo" className="redemption-games">
      {game && <Link className="button secondary" href={central}>Todos os jogos</Link>}
      {games.map(item => <Link className="button secondary" key={item.slug}
        aria-current={item.slug === game?.slug ? 'page' : undefined} href={pageFor(item)}
        onClick={() => trackAction('redemption_game_select', { game_slug: item.slug })}>
        <Gift size={16} aria-hidden="true" />{item.name}</Link>)}
    </nav>
    <section className="panel redemption-filters" aria-label="Filtros de códigos">
      {!game && <div><label htmlFor="redemption-game-filter">Jogo</label><select id="redemption-game-filter" value={gameFilter} onChange={event => {
        const selected = games.find(item => item.slug === event.target.value);
        setGameFilter(selected?.slug ?? '');
        if (selected) trackAction('redemption_game_select', { game_slug: selected.slug });
      }}>
        <option value="">Todos os jogos</option>
        {games.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}
      </select></div>}
      <div><label htmlFor="redemption-status-filter">Disponibilidade</label><select id="redemption-status-filter" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
        <option value="disponiveis">Disponíveis para tentar</option>
        <option value="todos">Todos os registros</option>
        {Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select></div>
      <label className="redemption-hide-used"><input type="checkbox" checked={hideUsed}
        onChange={event => savePreferences(used, event.target.checked)} /> Ocultar utilizados</label>
      <p role="status">{listed.length} {listed.length === 1 ? 'código encontrado' : 'códigos encontrados'}</p>
    </section>
    <p className="redemption-note">As fontes foram conferidas na data indicada. A confirmação final acontece no jogo ou no canal oficial.</p>
    <p role="status" className="redemption-notice">{notice}</p>
    {displayGames.map(item => {
      const codes = listed.filter(({ entry }) => entry.game === item.slug);
      return <section className="redemption-group" key={item.slug} aria-labelledby={'resgate-' + item.slug}>
        <div className="redemption-instructions">
          <h2 id={'resgate-' + item.slug}>{item.name}</h2>
          <p>{steps[item.slug]}</p>
          <a className="button secondary" data-game={item.slug} data-redemption="" href={item.redemption}>
            {item.slug === 'wuthering-waves' ? 'Ver instruções oficiais' : 'Abrir resgate oficial'} <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
        {codes.length === 0 ? <p className="panel">Nenhum código deste jogo corresponde aos filtros.</p> :
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
              <p className="redemption-highlight">{remaining !== null && remaining > 0 && remaining <= 48 * 3600000 ? 'Vence em breve' : 'Código recente'}</p>}
            <p><strong>Recompensas em destaque</strong><br />{entry.rewards.join(' · ')}</p>
            <p>{entry.expiresAt ? <>Prazo oficial: <time dateTime={entry.expiresAt}>{deadline.format(Date.parse(entry.expiresAt))} (Brasília)</time></>
              : 'Validade desconhecida. Disponibilidade relatada nas fontes.'}</p>
            {remaining !== null && remaining > 0 && <p>Tempo restante: {Math.floor(remaining / 3600000)} h {Math.floor(remaining / 60000) % 60} min {Math.floor(remaining / 1000) % 60} s</p>}
            {entry.editorialNote && <p>Nota editorial: {entry.editorialNote}</p>}
            <p>Última conferência das fontes: <time dateTime={entry.verifiedOn}>{date.format(Date.parse(entry.verifiedOn))}</time></p>
            <ul className="redemption-sources" aria-label="Fontes">{entry.sources.map(source => <li key={source.url}>
              <a href={source.url}>{source.title}</a> <span>({source.type})</span>
            </li>)}</ul>
            <div className="redemption-actions">
              {redeemable && <button type="button" className="button primary" onClick={() => void copy(entry)} aria-label={'Copiar ' + entry.code}>
                <Copy size={16} aria-hidden="true" />Copiar código
              </button>}
              {redeemable && item.slug !== 'wuthering-waves' && <a className="button secondary"
                href={redemptionUrl.href} target="_blank" rel="noreferrer" data-game={item.slug} data-redemption=""
                onClick={() => void copy(entry)}>Copiar e resgatar <ExternalLink size={15} aria-hidden="true" /></a>}
              <label><input type="checkbox" checked={marked} onChange={() => savePreferences(
                marked ? used.filter(key => key !== codeKey(entry)) : [...used, codeKey(entry)], hideUsed
              )} /> Já utilizado</label>
            </div>
          </li>;
          })}</ul>}
      </section>;
    })}
    <Link className="back-link" href="/artigos/onde-resgatar-codigos/">Guia de resgate dos quatro jogos</Link>
  </div>;
}
