import assert from 'node:assert/strict';
import test from 'node:test';
import { articles } from '../src/content/articles';
import { articleFeed, articleGraph, jsonLd } from '../src/lib/article-distribution';
import { bannerAnnouncements, banners } from '../src/content/banners';
import { reviewBanners } from '../scripts/banner-review';
import { proposalKey } from '../scripts/proposal-check';

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
  const recap = { ...video, id: '-g94CfWB-gI', title: 'Version 3.4 Special Program Recap 2' };
  const phase = { ...video, id: 'bbbbbbbbbbb', title: 'Version 3.4 Signal Search Phase II' };
  const report = reviewBanners(banners, [video, video, recap, phase, { ...video, id: 'ccccccccccc', title: 'Version 3.3 Special Program' },
    { ...video, id: 'zzzzzzzzzzz', publishedAt: '2026-10-01T15:00Z' }], now);
  assert.deepEqual(report.candidates, [
    { game, version: '3.4', event: 'fase-2', sources: ['https://www.youtube.com/watch?v=bbbbbbbbbbb'] },
    { game, version: '3.4', event: 'programa-especial', sources: ['https://www.youtube.com/watch?v=-g94CfWB-gI', 'https://www.youtube.com/watch?v=abcdefghijk'] },
  ]);
  assert.equal(report.expired.length, 0);
  assert.deepEqual(reviewBanners(banners, [video, recap, phase], now, bannerAnnouncements).candidates,
    [report.candidates[0]]);
});

test('fontes adicionais do mesmo evento não geram nova proposta', () => {
  const event = { game: 'zenless-zone-zero', version: '3.4', event: 'programa-especial',
    sources: ['https://www.youtube.com/watch?v=s1E6w6QrYZA'] };
  const wrap = (candidates: (typeof event)[]) => ({ candidates: [], recentlyExpired: [],
    calendar: { candidates, expired: [], uncovered: [] } });
  assert.equal(proposalKey(wrap([event])), proposalKey(wrap([{ ...event,
    sources: [...event.sources, 'https://www.youtube.com/watch?v=-g94CfWB-gI'] }])));
  assert.notEqual(proposalKey(wrap([event])), proposalKey(wrap([{ ...event, event: 'fase-1' }])));
  assert.throws(() => proposalKey(wrap([event, event])), /duplicado/);
});
