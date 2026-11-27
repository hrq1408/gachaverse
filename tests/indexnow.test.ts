import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { acknowledge, canonical, changes, checkKey, confirmedRemoval, fingerprint, keyName, origin, submit, validateState, writeKey } from '../scripts/indexnow/core.mjs';

const key = 'synthetic-indexnow-token';
const location = origin + '/' + key + '.txt';
const one = origin + '/artigos/guia/';
const two = origin + '/es/guias/guia/';
const three = origin + '/en/guides/guide/';

test('IndexNow grava a chave em UTF-8 sem espaços, BOM ou quebra de linha', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'indexnow-'));
  try {
    await writeKey(dir, key);
    assert.deepEqual(await readFile(join(dir, keyName(key))), Buffer.from(key));
    await assert.rejects(writeKey(dir, '../unsafe'));
    await assert.rejects(checkKey(key, async () => new Response('<html>', { status: 200, headers: { 'Content-Type': 'text/html' } })));
    assert.equal(await checkKey(key, async path => {
      assert.equal(path, location);
      return new Response(key, { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }), location);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('IndexNow detecta novidades, mudanças e remoções somente até o recebimento', () => {
  const state = validateState({ version: 1, retryAt: 0, received: { [one]: fingerprint('old'), [three]: fingerprint('gone') } });
  const current = { [one]: fingerprint('updated'), [two]: fingerprint('new') };
  assert.deepEqual(changes(state.received, current), { added: [two], changed: [one], removed: [three] });
  for (const status of [200, 202]) {
    const next = acknowledge(state, current, [one, two, three], { status, retryAt: 0 });
    assert.deepEqual(next.received, current);
    assert.deepEqual(changes(next.received, current), { added: [], changed: [], removed: [] });
  }
});

test('IndexNow exclui URLs não canônicas, privadas, estáticas e de tracker externo', async () => {
  for (const url of [
    one + '?utm_source=spam', one + '#intro', origin + '/sitemap.xml',
    origin + '/ferramentas/warp-tracker/painel/', origin + '/rascunhos/teste/',
    'https://gachaverse-tracker.pages.dev/',
  ]) assert.equal(canonical(url), false);
  assert.equal(canonical(origin + '/en/pity-calculator/'), true);
  for (const status of [200, 301, 403, 500]) {
    assert.equal(await confirmedRemoval(one, async () => new Response(null, { status })), false);
  }
  for (const status of [404, 410]) {
    assert.equal(await confirmedRemoval(one, async () => new Response(null, { status })), true);
  }
});

test('IndexNow envia JSON deduplicado e preserva estado em recusas HTTP', async () => {
  const state = validateState({ version: 1, retryAt: 0, received: {} });
  for (const status of [200, 202, 400, 403, 422]) {
    const result = await submit(key, location, [one, one], { send: async (url, init) => {
      assert.equal(url, 'https://api.indexnow.org/indexnow');
      assert.equal(init?.method, 'POST');
      assert.deepEqual(JSON.parse(String(init?.body)), { host: 'gachaverse.pages.dev', key, keyLocation: location, urlList: [one] });
      return new Response(null, { status });
    } });
    assert.equal(result.status, status);
    if (status >= 400) assert.deepEqual(acknowledge(state, { [one]: fingerprint('new') }, [one], result), state);
  }
});

test('IndexNow faz no máximo uma retentativa breve e persiste Retry-After longo', async () => {
  let attempts = 0;
  let clock = 1_700_000_000_000;
  const result = await submit(key, location, [one], {
    now: () => clock,
    wait: async (ms: number) => { assert.equal(ms, 2000); clock += ms; },
    send: async () => {
      attempts++;
      return new Response(null, { status: 429, headers: { 'Retry-After': attempts === 1 ? '2' : '3600' } });
    },
  });
  assert.equal(attempts, 2);
  assert.equal(result.status, 429);
  const state = validateState({ version: 1, retryAt: 0, received: {} });
  assert.equal(acknowledge(state, { [one]: fingerprint('new') }, [one], result).retryAt, clock + 3_600_000);
});

test('IndexNow usa somente HTML indexável e ignora scripts e contagens regressivas', async () => {
  const { manifest } = await import('../scripts/indexnow/manifest.mjs');
  const { mkdir, writeFile } = await import('node:fs/promises');
  const dir = await mkdtemp(join(tmpdir(), 'indexnow-html-'));
  try {
    await writeFile(join(dir, 'sitemap.txt'), [one, two, origin + '/ferramentas/warp-tracker/painel/'].join('\n'));
    for (const url of [one, two]) await mkdir(join(dir, new URL(url).pathname), { recursive: true });
    const page = (url: string, body: string, robots = 'index') =>
      '<!doctype html><head><link rel="canonical" href="' + url + '"><meta name="robots" content="' + robots +
      '"><title>Guia</title></head><body><main>' + body + '</main></body>';
    const index = join(dir, new URL(one).pathname, 'index.html');
    await writeFile(join(dir, new URL(two).pathname, 'index.html'), page(two, '<h1>Rascunho</h1>', 'noindex, follow'));
    await writeFile(index, page(one, '<h1>Guia</h1><p>Prazo: 2 h 4 min 2 s</p><script src="/_next/a.js"></script>'));
    const first = await manifest(dir);
    assert.deepEqual(Object.keys(first), [one]);
    await writeFile(index, page(one, '<h1>Guia</h1><p>Prazo: 2 h 4 min 1 s</p><script src="/_next/b.js"></script>'));
    assert.deepEqual(await manifest(dir), first);
    await writeFile(index, page(one, '<h1>Guia revisto</h1>'));
    assert.notDeepEqual(await manifest(dir), first);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
