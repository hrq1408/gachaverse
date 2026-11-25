import assert from 'node:assert/strict';
import test from 'node:test';
import { historySchema, mergeHistory, type Warp } from '../src/features/tracker/history';
import { advertisingPolicy, eligible } from '../src/features/advertising/config';
const row: Warp = { id:'10', item:'Teste local', data:'2026-01-01T00:00:00Z', estrelas:4, banner:'cone' };
test('rejeita campos privados e formatos incompatíveis', () => {
  assert.ok(historySchema.safeParse({ version:1,saltos:[row] }).success);
  for(const invalid of [{...row,uid:'privado'},{...row,data:'sem fuso'},{...row,banner:'permanente'}])
    assert.equal(historySchema.safeParse({version:1,saltos:[invalid]}).success,false);
});
test('mescla sem duplicar, ordena IDs e rejeita conflitos', () => {
  assert.deepEqual(mergeHistory([row],[{...row,id:'9'},row]),[row,{...row,id:'9'}]);
  assert.throws(()=>mergeHistory([row],[{...row,estrelas:5}]),/conflitantes/);
});
test('flag de publicidade sozinha mantém todas as unidades fechadas', () => {
  assert.equal(eligible({...advertisingPolicy,enabled:true},'0000000000'),false);
  assert.equal(eligible({...advertisingPolicy,enabled:true,publisherApproved:true,privateOriginIsolated:true,certifiedConsent:true}),false);
});
