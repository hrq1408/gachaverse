import assert from 'node:assert/strict';
import test from 'node:test';
import { advertisingPolicy, autoAdsSource } from '../src/features/advertising/config';
import { legacyStorageClear, loadAutoAds } from '../src/features/advertising/privacy';

const clientId = 'ca-pub-6914991641652412';
const ready = { enabled: true, publisherApproved: false, certifiedConsent: true, privateOriginIsolated: true };
const source = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + clientId;

test('Auto ads prepara a tag oficial independentemente de unidades manuais e da revisão do Google', () => {
  assert.equal(autoAdsSource(ready, true, clientId), source);
  for (const key of ['enabled', 'certifiedConsent', 'privateOriginIsolated'] as const) {
    assert.equal(autoAdsSource({ ...ready, [key]: false }, true, clientId), null);
  }
  assert.equal(autoAdsSource(ready, false, clientId), null);
  assert.equal(autoAdsSource(ready, true, 'inválido'), null);
  assert.equal(autoAdsSource({ ...advertisingPolicy, enabled: false }, true, clientId), null);
});

test('a verificação do banco legado falha de forma fechada', async () => {
  assert.equal(await legacyStorageClear(undefined), false);
  assert.equal(await legacyStorageClear({ databases: async () => { throw Error(); } }), false);
  assert.equal(await legacyStorageClear({ databases: async () => [{ name: 'gachaverse-warp-v1' }] }), false);
  assert.equal(await legacyStorageClear({ databases: async () => [{ name: 'outro' }] }), true);
});

test('sem aceite ou com banco legado não injeta a tag; duas chamadas autorizadas injetam uma vez', async (t) => {
  const scripts: HTMLScriptElement[] = [];
  let preference = 'declined';
  let databases: IDBDatabaseInfo[] = [{ name: 'gachaverse-warp-v1' }];
  for (const [key, value] of Object.entries({
    localStorage: { getItem: () => preference },
    window: { indexedDB: { databases: async () => databases } },
    document: {
      createElement: () => ({}),
      getElementById: (id: string) => scripts.find(script => script.id === id),
      head: { append: (script: HTMLScriptElement) => scripts.push(script) },
    },
  })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, key, previous);
      else Reflect.deleteProperty(globalThis, key);
    });
  }
  await loadAutoAds(source);
  preference = 'accepted';
  await loadAutoAds(source);
  assert.equal(scripts.length, 0);
  databases = [];
  await Promise.all([loadAutoAds(source), loadAutoAds(source)]);
  assert.deepEqual(scripts, [{ id: 'gachaverse-adsense', async: true, crossOrigin: 'anonymous', src: source }]);
});
