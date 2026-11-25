'use client';

import { useRef } from 'react';
import { Gem, Orbit, RotateCcw, Ticket } from 'lucide-react';
import { trackAction } from '@/lib/analytics';
import { calculate, whole, type GameRules } from '../domain/calculation';
import { usePlan } from '../hooks/use-plan';

const number = new Intl.NumberFormat('pt-BR');
export function Calculator({ game }: { game: GameRules }) {
  const { banner, plan, change, select, reset } = usePlan(game);
  const result = calculate(plan, banner, game.cost);
  const dirty = useRef(false);
  function finish() {
    if (dirty.current) trackAction('pity_calculation', {});
    dirty.current = false;
  }
  function edit(key: 'pity' | 'tickets' | 'currency', value: string) {
    dirty.current = true;
    change({ [key]: whole(Number(value), key === 'pity' ? banner.hardPity - 1 : undefined) });
  }
  return <div className="pity-grid">
    <fieldset className="pity-panel" aria-labelledby="plan-title">
      <h2 id="plan-title"><Orbit aria-hidden="true"/> Seu planejamento</h2>
      <label htmlFor="banner">Banner promocional</label>
      <select id="banner" value={banner.id} onChange={e => { select(e.target.value); trackAction('pity_banner_change', {}); }}>
        {game.banners.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}</select>
      <div className="pity-row"><label htmlFor="pity">Pity atual</label>
        <input id="pity" type="number" inputMode="numeric" min="0" max={banner.hardPity - 1} value={plan.pity || ''} placeholder="0" onChange={e => edit('pity', e.target.value)} onBlur={finish}/></div>
      <input aria-label="Ajustar pity atual" type="range" min="0" max={banner.hardPity - 1} value={plan.pity} onChange={e => edit('pity', e.target.value)} onPointerUp={finish} onBlur={finish}/>
      <div className="range-ends"><span>0</span><span>{banner.hardPity - 1}</span></div>
      <label className="guarantee"><input type="checkbox" checked={plan.guaranteed} onChange={e => { change({ guaranteed: e.target.checked }); trackAction('pity_calculation', {}); }}/> Garantia promocional ativa</label>
      <div className="pity-wallet">{(['currency', 'tickets'] as const).map(key => <label key={key}>
        <span>{key === 'currency' ? <Gem/> : <Ticket/>}{game[key]}</span>
        <input type="number" min="0" inputMode="numeric" placeholder="0" value={plan[key] || ''} onChange={e => edit(key, e.target.value)} onBlur={finish}/></label>)}</div>
      <button className="pity-reset" onClick={() => { reset(); trackAction('pity_calculator_reset', {}); }}><RotateCcw size={16}/> Reiniciar este banner</button>
    </fieldset>
    <section className="pity-result" aria-labelledby="result-title"><h2 id="result-title">Reserva para o destaque</h2>
      <div className="pity-big">{number.format(result.available)} <span>Saltos disponíveis</span></div>
      <progress aria-label="Saltos disponíveis para cobrir o limite do destaque" value={result.covered} max={result.target}/>
      <p>{result.covered} de {result.target} Saltos cobertos</p>
      <dl>{[['Até o próximo cinco estrelas',result.next],['Até o destaque garantido',result.target],['Saltos adicionais necessários',result.missing],[game.currency + ' adicionais',result.currencyMissing]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{number.format(Number(value))}</dd></div>)}</dl>
      <p role="status" aria-atomic="true">{result.missing ? 'Saldo adicional para cobrir o pior cenário: ' + number.format(result.currencyMissing) + ' ' + (result.currencyMissing === 1 ? game.currencySingular : game.currency) + '.' : 'Sua reserva já cobre o destaque mesmo no pior cenário.'}</p>
    </section>
  </div>;
}
