import assert from 'node:assert/strict';
import test from 'node:test';
import { calculate, emptyPlan, whole } from '../src/features/pity/domain/calculation';
import { starRail } from '../src/features/pity/config/games';
import { restore, updatePlan } from '../src/features/pity/domain/storage';

const [character, cone] = starRail.banners;
test('limites de personagem e cone com e sem garantia', () => {
  for (const banner of [character, cone]) {
    assert.equal(calculate(emptyPlan(), banner, 160).target, banner.hardPity * 2);
    const plan = { ...emptyPlan(), pity: banner.hardPity - 1 };
    assert.equal(calculate(plan, banner, 160).next, 1);
    assert.equal(calculate(plan, banner, 160).target, 1 + banner.hardPity);
    assert.equal(calculate({ ...plan, guaranteed: true }, banner, 160).target, 1);
  }
});
test('saldo parcial preserva cada Jade e saldo suficiente zera o déficit', () => {
  const plan = { pity: 70, guaranteed: true, tickets: 2, currency: 2879 };
  assert.deepEqual(calculate(plan, character, 160), {next:20,target:20,available:19,missing:1,currencyMissing:1,covered:19});
  assert.equal(calculate({...plan,currency:2880}, character, 160).missing,0);
  assert.equal(calculate({...plan,tickets:30}, character, 160).currencyMissing,0);
});
test('normaliza números e respeita o limite do banner', () => {
  for (const value of [-10, NaN, Infinity]) assert.equal(whole(value),0);
  assert.equal(whole(2.9),2);
  assert.equal(whole(100,79),79);
});
test('troca, persistência e reinício preservam o outro banner', () => {
  const s = updatePlan(restore(null, starRail), {...emptyPlan(),pity:55});
  const other = updatePlan({...s,selected:cone.id},{...emptyPlan(),tickets:3});
  assert.deepEqual(restore(JSON.stringify(other),starRail),other);
  const reset = updatePlan(other,emptyPlan());
  assert.equal(reset.plans[character.id].pity,55);
  assert.deepEqual(reset.plans[cone.id],emptyPlan());
});
test('recupera armazenamento corrompido, versão desconhecida e plano inválido', () => {
  const zero=restore(null,starRail);
  for(const bad of ['{','null','{"version":2}']) assert.deepEqual(restore(bad,starRail),zero);
  for(const pity of [-1,1.2,90,'9']) {
    const broken={...zero,selected:'inexistente',plans:{personagem:{...emptyPlan(),pity}}};
    assert.deepEqual(restore(JSON.stringify(broken),starRail),zero);
  }
});
