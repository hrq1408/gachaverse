import assert from 'node:assert/strict';
import { test } from 'node:test';
import { entryAttribution } from '../src/lib/analytics-attribution';

const origin = 'https://gachaverse.pages.dev';

test('uses the search engine origin while discarding the search query and referrer path', () => {
  assert.deepEqual(entryAttribution(origin, origin + '/en/', 'https://www.google.com/search?q=private'), {
    campaign: '', referrer: 'https://www.google.com/',
  });
});

test('keeps valid campaign slugs and strips arbitrary query fields and personal identifiers', () => {
  const landing = origin + '/es/?utm_source=guia&utm_medium=referral&utm_campaign=guias-2026'
    + '&utm_term=nome%40example.org&utm_id=123456789&utm_content=a&utm_content=b&uid=12345#section';
  assert.deepEqual(entryAttribution(origin, landing, 'https://example.org/artigo?sessao=privada'), {
    campaign: '?utm_source=guia&utm_medium=referral&utm_campaign=guias-2026',
    referrer: 'https://example.org/',
  });
});

test('discards same-origin or invalid referrers and third-party campaign URLs', () => {
  for (const referrer of [origin + '/medicao.html', 'javascript:void(0)', 'https://name:password@example.org/', '']) {
    assert.deepEqual(entryAttribution(origin, 'https://example.org/?utm_source=spam', referrer), {
      campaign: '', referrer: '',
    });
  }
});
