import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parse } from 'yaml';
import { articles } from '../src/content/articles';
import { collectSearchConsole, comparisonWindows, property } from '../scripts/editorial-intelligence/search-console';
import { seoOpportunities } from '../scripts/editorial-intelligence/opportunities';
import { editorialQueue } from '../scripts/editorial-intelligence/queue';
import { importTrends } from '../scripts/editorial-intelligence/trends';
import type { OfficialVideo } from '../scripts/redemption-sources';

const now = new Date('2026-11-26T03:00:00Z');
const article = articles.find(item => item.slug === 'honkai-star-rail-cones-de-luz')!;
const articlePage = property + 'artigos/' + article.slug + '/';
const otherPage = property + 'artigos/honkai-star-rail-reliquias/';
const keyword = 'honkai star rail cones de luz';

test('janelas usam dia no Pacífico e comparação sem sobreposição', () => {
  const [week, month, quarter] = comparisonWindows(now);
  assert.deepEqual(week, { days: 7, current: { startDate: '2026-11-16', endDate: '2026-11-22' },
    previous: { startDate: '2026-11-09', endDate: '2026-11-15' } });
  assert.equal(month.previous.endDate, '2026-10-25');
  assert.equal(quarter.current.startDate, '2026-08-25');
});

test('cliente lê só endpoints previstos, compara períodos e não transforma ausência em zero', async () => {
  let calls = 0;
  const mockedFetch: typeof fetch = async (input, init) => {
    calls++;
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('authorization'), 'Bearer teste');
    const url = new URL(String(input));
    assert.equal(url.hostname, 'www.googleapis.com');
    assert.ok(url.pathname.includes(encodeURIComponent(property)));
    if (url.pathname.endsWith('/sitemaps')) {
      assert.equal(init?.method, 'GET');
      return Response.json({ sitemap: [{ path: property + 'sitemap.xml', errors: '0', warnings: 0, isPending: true }] });
    }
    assert.equal(init?.method, 'POST');
    const payload = JSON.parse(String(init?.body));
    assert.equal(payload.dimensionFilterGroups[0].filters[0].expression, 'bra');
    assert.equal(payload.dataState, 'final');
    assert.equal(payload.type, 'web');
    const row = (keys: string[], impressions = 120) => ({ keys, clicks: 1, impressions, ctr: 1 / impressions, position: 8 });
    if (payload.endDate === '2026-11-15') return Response.json({});
    if (payload.dimensions.length === 0) return Response.json({ rows: [row([], 200)] });
    if (payload.dimensions.join(',') === 'query,page') return Response.json({
      rows: [row([keyword, articlePage]), row([keyword, otherPage], 25)],
    });
    return Response.json({ rows: [row([payload.dimensions[0] === 'query' ? keyword : articlePage])] });
  };
  const data = await collectSearchConsole('teste', now, mockedFetch);
  assert.equal(calls, 25);
  assert.equal(data.sitemaps[0].warnings, '0');
  assert.equal(data.windows[0].comparison, null);
  assert.equal(data.windows[1].comparison?.clicks, 0);
  assert.deepEqual(data.windows[1].queryChanges[0].keys, [keyword]);
  assert.equal(data.windows[0].queryChanges.length, 0);

  const seo = seoOpportunities(data, articles);
  assert.equal(seo.conflicts.length, 1);
  assert.equal(seo.lowCtrPages[0].currentTitle, article.titulo);
  assert.equal(seo.keywords[0].measuredArticles[0], article.slug);
  const [brief] = editorialQueue(articles, [], now, seo);
  assert.equal(brief.evidence, 'métricas observadas');
  assert.equal(brief.action, 'revisar artigo existente');
  assert.equal(brief.reviewStatus, 'pendente');
  assert.equal(brief.slug, article.slug);
});

test('erro da API descarta corpo sensível e não repete chamadas', async () => {
  let calls = 0;
  await assert.rejects(collectSearchConsole('token privado', now, async () => {
    calls++;
    return Response.json({ error: 'valor confidencial' }, { status: 403 });
  }), { message: 'Search Console retornou HTTP 403 em /searchAnalytics/query.' });
  assert.equal(calls, 1);
});

test('CSV do Trends preserva censura e dados ausentes, rejeitando regiões diferentes', () => {
  const input = '\uFEFFCategoria: Todas as categorias\r\n\r\nSemana,"Palavra, exemplo: (Brasil)",Genshin: (Brazil)\r\n2026-11-01,<1,\r\n2026-11-08,0,100\r\n';
  const trends = importTrends(input);
  assert.equal(trends.region, 'BR');
  assert.deepEqual(trends.series.map(row => row.values), [['<1', null], [0, 100]]);
  assert.throws(() => importTrends(input.replace('(Brasil)', '(Mundo)')), /região Brasil/);
  assert.throws(() => importTrends(input.replace(',0,100', ',0,101')), /índice inválido/);
  assert.throws(() => importTrends(input.replace('2026-11-08', '2026-11-31')), /índice inválido/);
});

test('novidades têm ID estável e agrupam fontes sem retomar evento publicado', () => {
  const video: OfficialVideo = { game: 'zenless-zone-zero', id: 'aaaaaaaaaaa', title: 'Version 3.5 Special Program',
    description: '', publishedAt: '2026-11-25T00:00:00Z' };
  const [first] = editorialQueue(articles, [video], now);
  const after = editorialQueue(articles, [video, { ...video, id: 'bbbbbbbbbbb' },
    { ...video, id: 'ccccccccccc', title: 'Version 3.4 Special Program' }], now);
  assert.equal(after.length, 1);
  assert.equal(after[0].id, first.id);
  assert.equal(after[0].officialSources.length, 2);
  assert.equal(after[0].evidence, 'hipótese editorial');
});

test('workflow público não usa OIDC, dados privados, artifacts ou deploy', () => {
  const workflow = parse(readFileSync('.github/workflows/inteligencia-editorial.yml', 'utf8'));
  const publicJob = workflow.jobs['fontes-publicas'];
  const privateJob = workflow.jobs['relatorios-privados'];
  assert.match(publicJob.if, /repository == 'hrq1408\/gachaverse'/);
  assert.doesNotMatch(JSON.stringify(publicJob), /GSC_|id-token|upload-artifact|deploy|pull-requests|contents: write/);
  assert.match(privateJob.if, /repository\.private == true/);
  assert.match(privateJob.if, /repository_id == '1473633500'/);
  assert.equal(privateJob.permissions['id-token'], 'write');
  const auth = privateJob.steps.find((step: { id?: string }) => step.id === 'google');
  assert.equal(auth.with.access_token_scopes, 'https://www.googleapis.com/auth/webmasters.readonly');
  assert.equal(auth.with.create_credentials_file, false);
});
