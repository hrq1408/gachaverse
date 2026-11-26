import assert from 'node:assert/strict';
import test from 'node:test';
import { banners, bannerStatus, validateBanners } from '../src/content/banners';
import { publicPaths } from '../src/content/editorial';
import { visibleOffers } from '../src/features/partners/catalog';
import { starRail } from '../src/features/pity/config/games';
import { restore, updatePlan } from '../src/features/pity/domain/storage';

test('calendário cobre quatro jogos, preserva horários regionais e rejeita duplicatas', () => {
  assert.equal(new Set(banners.map(banner => banner.game)).size, 4);
  assert.equal(publicPaths().filter(path => path.endsWith('/calendario/')).length, 5);
  assert.throws(() => validateBanners([banners[0], banners[0]]), /duplicado/);
  assert.throws(() => validateBanners([{ ...banners[0], end: '2026-10-01' }]));
  assert.throws(() => validateBanners([{ ...banners[0], game: 'genshin-impact' }]));
  assert.equal(bannerStatus(banners[0], Date.parse('2026-11-26T15:00:00Z')), 'Em andamento');
  assert.equal(bannerStatus(banners[0], Date.parse('2026-12-22T15:00:00Z')), 'Confira no servidor');
  assert.equal(bannerStatus(banners[0], Date.parse('2026-12-24T00:00:00Z')), 'Encerrado');
});

test('editar pela família do calendário preserva o plano da outra família', () => {
  const state = restore(null, starRail);
  const updated = updatePlan(state, { ...state.plans.cone, pity: 30 }, 'cone');
  assert.equal(updated.selected, 'personagem');
  assert.equal(updated.plans.cone.pity, 30);
  assert.equal(updated.plans.personagem.pity, 0);
});

test('ofertas precisam de chave e aprovação; recargas exigem fonte e o destino deve usar HTTPS', () => {
  const fixture = { id: 'teste', title: 'Teste', partner: 'Teste', description: 'Teste', url: 'https://example.com/', relationship: 'afiliado', category: 'produto', approved: false };
  assert.deepEqual(visibleOffers(false, [{ ...fixture, approved: true }]), []);
  assert.deepEqual(visibleOffers(true, [fixture]), []);
  assert.equal(visibleOffers(true, [{ ...fixture, approved: true }]).length, 1);
  assert.throws(() => visibleOffers(true, [{ ...fixture, url: 'http://example.com/' }]));
  assert.throws(() => visibleOffers(true, [{ ...fixture, category: 'recarga' }]), /publicador/);
  assert.throws(() => visibleOffers(true, [fixture, fixture]), /duplicada/);
});
