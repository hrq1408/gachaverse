import assert from 'node:assert/strict';
import test from 'node:test';
import { parseFile, encode, formats, canExport, merge, type Row } from '../tracker/formats';
import { analyze, probability } from '../tracker/analysis';
const raw = {
  id: '1000000000000000001',
  gacha_type: '11',
  gacha_id: '101',
  item_id: '101',
  rank_type: '5',
  name: 'Teste',
  time: '2026-01-01 02:00:00',
};
const info = { export_app: 'Fixture', export_timestamp: 0, export_app_version: '1', version: 'v4.2' };
const account = { uid: '1001', timezone: 8, lang: 'pt-pt', list: [raw] };
const file = { info, hkrpg: [account] };
test('round-trip por versão preserva strings de ID e o horário do servidor', () => {
  const [p] = parseFile(file).profiles;
  for (const format of formats.filter((f) => f !== 'GachaVerse 1')) {
    const [result] = parseFile(encode(p, format)).profiles;
    assert.equal(result.uid, p.uid);
    assert.equal(result.rows[0].source?.time, raw.time);
    assert.equal(result.rows[0].id, raw.id);
    assert.equal(result.rows[0].instant, '2025-12-31T18:00:00.000Z');
  }
  const [v1] = parseFile(encode(p, 'GachaVerse 1'), 'Conta A').profiles;
  assert.equal(v1.key, 'local:Conta A');
  assert.equal(canExport(v1, 'UIGF 4.2'), false);
});
test('duas contas com o mesmo ID, repetição e conflito', () => {
  const base = parseFile({ ...file, hkrpg: [account, { ...account, uid: 1002 }] }).profiles;
  const result = merge(base, base);
  assert.equal(result.length, 2);
  assert.equal(result[0].rows.length, 1);
  assert.throws(
    () => merge(base, [{ ...base[0], rows: [{ ...base[0].rows[0], family: '12' }] }]),
    /conflitantes/,
  );
  assert.equal(base[0].rows[0].family, '11');
});
test('colaborações, datas inválidas e campos opcionais', () => {
  const p = parseFile({
    ...file,
    hkrpg: [
      { ...account, list: [{ ...raw, gacha_type: '21', rank_type: undefined, name: undefined }] },
    ],
  }).profiles[0];
  assert.equal(canExport(p, 'UIGF 4.1'), true);
  assert.equal(canExport(p, 'UIGF 4.0'), false);
  assert.equal(canExport(p, 'SRGF 1.0'), false);
  assert.equal(canExport(p, 'GachaVerse 1'), false);
  assert.throws(() =>
    parseFile({ ...file, hkrpg: [{ ...account, list: [{ ...raw, time: '2026-02-31 12:00:00' }] }] }),
  );
});
const row = (id: number, rank: Row['rank'], featured?: boolean): Row => ({
  id: String(id),
  instant: '2026-03-01T00:00:00Z',
  family: '11',
  rank,
  featured,
});
test('pity e garantia dependem da família, raridade e evidência do destaque', () => {
  const history = [
    row(4, '3'),
    { ...row(3, '5'), family: '12' as const },
    row(2, '5', false),
    row(1, '5', true),
  ];
  const s = analyze(history, '11');
  assert.equal(s.distance, 1);
  assert.equal(s.guarantee, 'Ativa');
  assert.deepEqual(s.cycles, [1]);
  assert.equal(analyze([row(1, '5', true)], '11').guarantee, 'Sem garantia ativa');
  assert.equal(analyze([row(2, '5'), row(1, '5', false)], '11').guarantee, 'Sem garantia ativa');
  assert.equal(analyze([row(2, '5')], '11').guarantee, 'Indeterminada');
  assert.equal(analyze([row(3, undefined), ...history], '11').anchored, false);
  assert.equal(analyze([row(1, '3')], '11').anchored, false);
  assert.equal(
    analyze(
      Array.from({ length: 90 }, (_, i) => row(i, '3')),
      '11',
    ).inconsistent,
    true,
  );
});
test('probabilidade acumulada: zero, dois ensaios e hard pity', () => {
  assert.equal(probability(0, 0, 90, 0.006), 0);
  assert.ok(Math.abs(probability(0, 2, 90, 0.006) - (1 - 0.994 ** 2)) < 1e-12);
  assert.equal(probability(79, 1, 80, 0.008), 1);
  assert.throws(() => probability(90, 1, 90, 0.006));
});
