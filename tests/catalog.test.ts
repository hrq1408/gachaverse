import assert from 'node:assert/strict';
import test from 'node:test';
import { games, gamePath, sectionPath, sections } from '../src/content/catalog';
import { activeCodes, articles, contentPath, publicPaths } from '../src/content/editorial';

test('every game has a distinct hub, distinct sections and HTTPS official sources', () => {
  assert.equal(games.length, 4);
  assert.equal(new Set(games.map(gamePath)).size, 4);
  for (const game of games) {
    assert.equal(new Set(sections.map((section) => sectionPath(section, game))).size, sections.length);
    for (const link of [game.official, game.redemption]) assert.equal(new URL(link).protocol, 'https:');
  }
});

test('the sitemap includes published articles and excludes empty categories', () => {
  const paths = publicPaths();
  assert.equal(new Set(paths).size, paths.length);
  assert.ok(paths.includes('/conteudo/codigos/'));
  for (const section of sections.filter((item) => item.slug !== 'codigos')) {
    assert.equal(paths.includes(sectionPath(section)), articles.some((article) => article.categoria === section.slug));
  }
  for (const article of articles) assert.ok(paths.includes(contentPath(article)));
});

test('published codes carry an official source and verification date', () => {
  for (const game of games) {
    for (const code of activeCodes(game, Date.now())) {
      assert.equal(new URL(code.source).protocol, 'https:');
      assert.ok(Number.isFinite(Date.parse(code.verifiedOn)));
    }
  }
});

