import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { articles } from '../src/content/articles';
import { articleFeed, articleGraph } from '../src/lib/article-distribution';
import { articleAlternates, publishedTranslations, readTranslation, sourceRevision, translationPath, translationQueue, translations } from '../src/i18n/articles';
import { feedPath, guidesPath, homePath } from '../src/i18n/locales';
import { homeAlternates, internationalSitemapPaths } from '../src/i18n/seo';
import { collectInternationalSearchConsole, parseInternationalMarkets, property } from '../scripts/editorial-intelligence/search-console';

const id = 'genshin-impact-cross-save';
const origin = property.slice(0, -1);
const source = articles.find(article => article.slug === id)!;
const drafts = translations.filter(row => row.editorialId === id);
function approved(locale: 'en' | 'es', collection = articles) {
  const row = drafts.find(draft => draft.locale === locale)!;
  const file = readFileSync('content/traducoes/' + locale + '/' + row.slug + '.md', 'utf8')
    .replace('status: "draft"', 'status: "published"').replace('reviewed: false', 'reviewed: true');
  return readTranslation(file, locale, collection);
}

test('the normal export excludes drafts and withdrawn entries and the queue covers the catalog', () => {
  assert.equal(drafts.length, 2);
  const paths = internationalSitemapPaths().map(row => row.path);
  assert.ok(paths.includes('/en/') && paths.includes('/es/'));
  for (const row of translations) {
    assert.equal(publishedTranslations.includes(row), row.status === 'published' && row.reviewed);
    assert.equal(paths.includes(translationPath(row)), row.indexable);
  }
  assert.equal(homeAlternates['x-default'], '/');
  assert.equal(translationQueue().length, articles.length * 2);
  assert.equal(translationQueue().filter(row => row.status === 'pendente').length, articles.length * 2 - translations.length);
});

test('published translations share reciprocal alternate paths and preserve the original facts and metadata', () => {
  const en = approved('en');
  const es = approved('es');
  const expected = {
    'pt-BR': '/artigos/' + id + '/',
    en: translationPath(en), es: translationPath(es), 'x-default': '/artigos/' + id + '/',
  };
  assert.deepEqual(articleAlternates(en.editorialId, [en, es]), expected);
  assert.deepEqual(articleAlternates(es.editorialId, [en, es]), expected);
  assert.equal(en.article.imagem, source.imagem);
  assert.deepEqual(es.article.fontes, source.fontes);
  assert.equal(es.article.publicacao, source.publicacao);
  assert.equal(es.article.atualizacao, source.atualizacao);
  assert.match(es.article.html, /hreflang="pt-BR"/);

  const schema = articleGraph(es.article, [{ name: 'Inicio', path: homePath('es') },
    { name: es.article.titulo, path: translationPath(es) }], origin, 'es');
  assert.equal(schema['@graph'][0].inLanguage, 'es');
  assert.equal(schema['@graph'][0].mainEntityOfPage, origin + expected.es);
  const rss = articleFeed([en.article], origin, 'English guides', {
    locale: 'en', home: homePath('en'), feed: feedPath('en'), articlePath: article => guidesPath('en') + article.slug + '/',
  });
  assert.match(rss, /<language>en<\/language>/);
  assert.ok(rss.includes(origin + expected.en));
});

test('source revision changes preserve the published URL; withdrawal requires an explicit reason', () => {
  const changed = articles.map(article => article.slug === id ? { ...source, html: source.html + '<p>Atualização</p>' } : article);
  assert.notEqual(sourceRevision(changed.find(article => article.slug === id)!), sourceRevision(source));
  const stale = approved('en', changed);
  assert.equal(stale.stale, true);
  assert.equal(stale.indexable, true);
  assert.equal(articleAlternates(id, [stale]).en, translationPath(stale));
  const row = drafts.find(draft => draft.locale === 'en')!;
  const file = readFileSync('content/traducoes/en/' + row.slug + '.md', 'utf8');
  const withdrawn = file.replace(/^status: .*$/m, 'status: "withdrawn"');
  assert.throws(() => readTranslation(withdrawn, 'en', articles), /withdrawalReason/);
  const removed = readTranslation(withdrawn.replace('reviewed: true', 'reviewed: true\nwithdrawalReason: "Regra enganosa"'), 'en', articles);
  assert.equal(removed.indexable, false);
  assert.equal(articleAlternates(id, [removed]).en, undefined);
  assert.throws(() => readTranslation(file.replace(/^status: .*$/m, 'status: "published"').replace(/reviewed: (?:true|false)/, 'reviewed: false'), 'en', articles), /revisão explícita/);
  assert.throws(() => readTranslation(file + '\n[Invalid](/pagina-que-nao-existe/)', 'en', articles), /Link interno/);
});

test('international Search Console uses page path and country filters without assuming the query language', async () => {
  const seen: { dimension: string; operator: string; expression: string }[][] = [];
  const markets = parseInternationalMarkets('en:gbr,es:esp,pt-br:prt');
  const result = await collectInternationalSearchConsole('test', new Date('2026-11-26T20:00:00Z'), markets, async (_, init) => {
    const payload = JSON.parse(String(init?.body));
    seen.push(payload.dimensionFilterGroups[0].filters);
    return Response.json({});
  });
  assert.equal(seen.length, 40);
  assert.deepEqual(seen[16], [
    { dimension: 'page', operator: 'includingRegex', expression: '^https://gachaverse\\.pages\\.dev/en/' },
    { dimension: 'country', operator: 'equals', expression: 'gbr' },
  ]);
  assert.equal(seen[32][0].operator, 'excludingRegex');
  assert.equal(result[0].status, 'available');
  if (result[0].status === 'available') assert.equal(result[0].comparison, null);
  assert.throws(() => parseInternationalMarkets('fr:fra'), /idioma:país/);
});
