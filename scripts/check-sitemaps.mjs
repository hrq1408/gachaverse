import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

export async function checkSitemaps(origin, page) {
  const [xml, plain] = await Promise.all([
    checkDelivery(origin, 'sitemap.xml', /^(application|text)\/xml$/i),
    checkDelivery(origin, 'sitemap.txt', /^text\/plain$/i),
  ]);
  const urls = await page.evaluate(source => {
    const doc = new DOMParser().parseFromString(source, 'application/xml');
    const namespace = 'http://www.sitemaps.org/schemas/sitemap/0.9';
    if (doc.querySelector('parsererror') || doc.documentElement.localName !== 'urlset' ||
        doc.documentElement.namespaceURI !== namespace) throw new Error('XML do sitemap inválido.');
    return [...doc.documentElement.children].map(entry => {
      const locations = [...entry.children].filter(child => child.namespaceURI === namespace && child.localName === 'loc');
      if (entry.localName !== 'url' || entry.namespaceURI !== namespace || locations.length !== 1) {
        throw new Error('Cada entrada do sitemap precisa de um único loc.');
      }
      return locations[0].textContent;
    });
  }, xml);

  assert(urls.length > 0, 'O sitemap precisa listar URLs.');
  assert.equal(new Set(urls).size, urls.length, 'URLs duplicadas no sitemap.');
  for (const value of urls) {
    const url = new URL(value);
    assert.equal(url.origin, origin, value);
    assert(!url.search && !url.hash && url.href === value, value);
  }
  assert.equal(plain, urls.join('\n') + '\n', 'O sitemap.txt diverge das URLs do XML.');
  console.log(urls.length + ' URLs válidas e sitemaps idênticos ao build, com e sem query string.');
  return xml;
}

async function checkDelivery(origin, name, type) {
  const expected = await readFile('out/' + name);
  for (const suffix of ['', '?deploy=' + encodeURIComponent(process.env.GITHUB_SHA || 'verify')]) {
    const url = origin + '/' + name + suffix;
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, url);
    const [mediaType, ...parameters] = (response.headers.get('content-type') ?? '').split(';');
    assert.match(mediaType.trim(), type, url);
    const charset = parameters.find(parameter => /^\s*charset=/i.test(parameter));
    if (charset) assert.match(charset.trim(), /^charset="?utf-8"?$/i, url);
    assert.match(response.headers.get('content-encoding') ?? 'identity', /^(identity|gzip|br|deflate|zstd)$/i, url);
    assert.notEqual(response.headers.get('cf-mitigated'), 'challenge', url);
    const cache = (response.headers.get('cache-control') ?? '').toLowerCase().split(',').map(directive => directive.trim());
    assert(cache.includes('no-store') || cache.includes('no-cache') ||
      (cache.includes('max-age=0') && cache.includes('must-revalidate')), url + ' permite cache sem revalidação.');
    const tag = response.headers.get('etag');
    if (tag) assert.match(tag, /^(?:W\/)?"[^"]*"$/, url);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), expected, url + ' diverge do build.');
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(expected);
}
