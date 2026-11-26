import assert from 'node:assert/strict';
import test from 'node:test';
import { articles } from '../src/content/articles';
import { articleFeed, articleGraph, jsonLd } from '../src/lib/article-distribution';
import { banners } from '../src/content/banners';
import { reviewBanners } from '../scripts/banner-review';

const origin = 'https://gachaverse.pages.dev';

test('as estruturas usam canônica, imagem, trilha e datas editoriais', () => {
  const article = articles[0];
  const path = '/artigos/' + article.slug + '/';
  const graph = articleGraph(article, [{ name: 'Início', path: '/' }, { name: article.titulo, path }], origin);
  assert.equal(graph['@graph'][0].mainEntityOfPage, origin + path);
  assert.equal(graph['@graph'][0].datePublished, article.publicacao);
  assert.equal(graph['@graph'][1].itemListElement?.at(-1)?.item, origin + path);
  assert(!jsonLd({ headline: '</script><script>' }).includes('<'));
});

test('o RSS usa o catálogo publicado e escapa caracteres XML', () => {
  const first = { ...articles[0], titulo: 'A & B < C' };
  const feed = articleFeed([first, ...articles.slice(1)], origin, 'Guias & ferramentas');
  assert(feed.includes('<title>A &amp; B &lt; C</title>'));
  assert(feed.includes('href="' + origin + '/rss.xml"'));
  assert.equal((feed.match(/<item>/g) ?? []).length, articles.length);
});

test('a auditoria sinaliza somente prévias recentes de versão nova', () => {
  const now = Date.parse('2026-11-26T15:00Z');
  const game = 'zenless-zone-zero';
  const video = { game, id: 'abcdefghijk', title: 'Version 3.4 Special Program', description: '', publishedAt: '2026-11-20T15:00Z' } as const;
  const report = reviewBanners(banners, [video, video, { ...video, id: 'bbbbbbbbbbb', title: 'Version 3.3 Special Program' },
    { ...video, id: 'zzzzzzzzzzz', publishedAt: '2026-10-01T15:00Z' }], now);
  assert.deepEqual(report.candidates, [{ game, version: '3.4', source: 'https://www.youtube.com/watch?v=abcdefghijk' }]);
  assert.equal(report.expired.length, 0);
});
