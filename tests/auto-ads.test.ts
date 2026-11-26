import assert from 'node:assert/strict';
import test from 'node:test';
import { advertisingPolicy, autoAdsSource } from '../src/features/advertising/config';
import { legacyStorageClear, loadAutoAds } from '../src/features/advertising/privacy';
import worker from '../public/_worker';

const clientId = 'ca-pub-6914991641652412';
const ready = { enabled: true, publisherApproved: false, certifiedConsent: true, privateOriginIsolated: true };
const source = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + clientId;

test('Auto ads prepara a tag oficial independentemente de unidades manuais e da revisão do Google', () => {
  assert.equal(autoAdsSource(ready, true, clientId), source);
  assert.equal(autoAdsSource({ ...ready, certifiedConsent: false }, true, clientId), source);
  for (const key of ['enabled', 'privateOriginIsolated'] as const) {
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
  let eligible = false;
  let regionChecks = 0;
  let inside = true;
  let databases: IDBDatabaseInfo[] = [{ name: 'gachaverse-warp-v1' }];
  for (const [key, value] of Object.entries({
    localStorage: { getItem: () => preference },
    fetch: async () => {
      regionChecks++;
      return Response.json({ eligible });
    },
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
  const load = () => loadAutoAds(source, () => inside);
  await load();
  assert.equal(regionChecks, 0);
  preference = 'accepted';
  await load();
  eligible = true;
  await load();
  assert.equal(scripts.length, 0);
  databases = [];
  inside = false;
  await load();
  assert.equal(scripts.length, 0);
  inside = true;
  await Promise.all([load(), load()]);
  assert.deepEqual(scripts, [{ id: 'gachaverse-adsense', async: true, crossOrigin: 'anonymous', src: source }]);
});

test('a decisão regional usa metadados da Cloudflare, restringe o host e respeita GPC', async () => {
  const base = 'https://gachaverse.pages.dev/_publicidade/elegibilidade';
  const env = { ASSETS: { fetch: () => new Response('estático') } };
  const decide = (country?: string, headers: HeadersInit = {}, url = base) => worker.fetch(
    Object.assign(new Request(url, { headers }), { cf: country ? { country } : undefined }), env,
  );
  const accepted = decide('BR');
  assert.deepEqual(await accepted.json(), { eligible: true });
  assert.match(accepted.headers.get('Cache-Control') ?? '', /no-store/);
  for (const country of [undefined, 'US', 'PT', 'GB', 'CH', 'XX']) {
    assert.deepEqual(await decide(country, { 'CF-IPCountry': 'BR' }).json(), { eligible: false });
  }
  assert.deepEqual(await decide('BR', { 'Sec-GPC': '1' }).json(), { eligible: false });
  assert.deepEqual(await decide('BR', {}, base.replace('https://', 'https://preview.')).json(), { eligible: false });
  assert.equal(await decide('BR', {}, 'https://gachaverse.pages.dev/').text(), 'estático');
});
