'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Gem, Orbit, RotateCcw, Ticket } from 'lucide-react';
import { trackAction } from '@/lib/analytics';
import { calculate, whole, type GameRules } from '../domain/calculation';
import { usePlan } from '../hooks/use-plan';
import type { Locale } from '@/i18n/locales';

const copy = {
  'pt-BR': { plan: 'Seu planejamento', banner: 'Banner promocional', pity: 'Pity atual', adjust: 'Ajustar pity atual', guaranteed: 'Garantia promocional ativa', reset: 'Reiniciar este banner', reserve: 'Reserva para o destaque', available: 'Saltos disponíveis', progress: 'Saltos disponíveis para cobrir o limite do destaque', next: 'Até o próximo cinco estrelas', target: 'Até o destaque garantido', missing: 'Saltos adicionais necessários', currency: 'adicionais', covered: (a: number, b: number) => a + ' de ' + b + ' Saltos cobertos', deficit: 'Saldo adicional para cobrir o pior cenário: ', coveredAll: 'Sua reserva já cobre o destaque mesmo no pior cenário.' },
  en: { plan: 'Your plan', banner: 'Featured banner', pity: 'Current pity', adjust: 'Adjust current pity', guaranteed: 'Featured item is guaranteed', reset: 'Reset this banner', reserve: 'Budget for the featured item', available: 'Warps available', progress: 'Warps available toward the featured guarantee', next: 'Until the next 5-star', target: 'Until the featured guarantee', missing: 'Additional Warps required', currency: 'needed', covered: (a: number, b: number) => a + ' of ' + b + ' Warps covered', deficit: 'Additional currency for the worst case: ', coveredAll: 'Your budget covers the featured item even in the worst case.' },
  es: { plan: 'Tu planificación', banner: 'Banner promocional', pity: 'Pity actual', adjust: 'Ajustar el pity actual', guaranteed: 'La recompensa destacada está garantizada', reset: 'Reiniciar este banner', reserve: 'Reserva para el destacado', available: 'Saltos disponibles', progress: 'Saltos disponibles para cubrir la garantía', next: 'Hasta el próximo cinco estrellas', target: 'Hasta garantizar el destacado', missing: 'Saltos adicionales necesarios', currency: 'adicionales', covered: (a: number, b: number) => a + ' de ' + b + ' saltos cubiertos', deficit: 'Saldo adicional para cubrir el peor caso: ', coveredAll: 'Tu reserva cubre el destacado incluso en el peor caso.' },
};
export function Calculator({ game, locale = 'pt-BR' }: { game: GameRules; locale?: Locale }) {
  const preferred = useSearchParams().get('banner') ?? undefined;
  return <CalculatorForm key={preferred} game={game} preferred={preferred} locale={locale} />;
}

export function CalculatorForm({ game, preferred, locale = 'pt-BR' }: { game: GameRules; preferred?: string; locale?: Locale }) {
  const c = copy[locale];
  const number = new Intl.NumberFormat(locale);
  const [manual, setManual] = useState(false);
  const { banner, plan, change, select, reset } = usePlan(game, manual ? undefined : preferred);
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
  return <div className="pity-grid" id="planejamento">
    <fieldset className="pity-panel" aria-labelledby="plan-title">
      <h2 id="plan-title"><Orbit aria-hidden="true"/> {c.plan}</h2>
      <label htmlFor="banner">{c.banner}</label>
      <select id="banner" value={banner.id} onChange={e => { setManual(true); select(e.target.value); trackAction('pity_banner_change', {}); }}>
        {game.banners.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}</select>
      <div className="pity-row"><label htmlFor="pity">{c.pity}</label>
        <input id="pity" type="number" inputMode="numeric" min="0" max={banner.hardPity - 1} value={plan.pity || ''} placeholder="0" onChange={e => edit('pity', e.target.value)} onBlur={finish}/></div>
      <input aria-label={c.adjust} type="range" min="0" max={banner.hardPity - 1} value={plan.pity} onChange={e => edit('pity', e.target.value)} onPointerUp={finish} onBlur={finish}/>
      <div className="range-ends"><span>0</span><span>{banner.hardPity - 1}</span></div>
      <label className="guarantee"><input type="checkbox" checked={plan.guaranteed} onChange={e => { change({ guaranteed: e.target.checked }); trackAction('pity_calculation', {}); }}/> {c.guaranteed}</label>
      <div className="pity-wallet">{(['currency', 'tickets'] as const).map(key => <label key={key}>
        <span>{key === 'currency' ? <Gem/> : <Ticket/>}{game[key]}</span>
        <input type="number" min="0" inputMode="numeric" placeholder="0" value={plan[key] || ''} onChange={e => edit(key, e.target.value)} onBlur={finish}/></label>)}</div>
      <button className="pity-reset" onClick={() => { reset(); trackAction('pity_calculator_reset', {}); }}><RotateCcw size={16}/> {c.reset}</button>
    </fieldset>
    <section className="pity-result" aria-labelledby="result-title"><h2 id="result-title">{c.reserve}</h2>
      <div className="pity-big">{number.format(result.available)} <span>{c.available}</span></div>
      <progress aria-label={c.progress} value={result.covered} max={result.target}/>
      <p>{c.covered(result.covered, result.target)}</p>
      <dl>{[[c.next,result.next],[c.target,result.target],[c.missing,result.missing],[game.currency + ' ' + c.currency,result.currencyMissing]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{number.format(Number(value))}</dd></div>)}</dl>
      <p role="status" aria-atomic="true">{result.missing ? c.deficit + number.format(result.currencyMissing) + ' ' + (result.currencyMissing === 1 ? game.currencySingular : game.currency) + '.' : c.coveredAll}</p>
    </section>
  </div>;
}
