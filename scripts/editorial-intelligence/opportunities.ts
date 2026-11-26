import { games } from '../../src/content/catalog';
import type { Article } from '../../src/content/articles';
import type { Metrics, SearchConsoleReport } from './search-console';
import { property } from './search-console';

export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ').trim();
const stop = new Set(['de', 'da', 'do', 'dos', 'das', 'a', 'o', 'e', 'em', 'para', 'no', 'na', 'como', 'um', 'uma']);
export const terms = (value: string) => new Set(normalize(value).split(' ').filter(term => term.length > 1 && !stop.has(term)));
export function overlap(a: string, b: string) {
  const left = terms(a);
  const right = terms(b);
  return [...left].filter(term => right.has(term)).length / Math.max(1, left.size);
}

export function gameFor(query: string) {
  const text = ' ' + normalize(query) + ' ';
  const aliases = {
    'honkai-star-rail': ['hsr', 'star rail'], 'genshin-impact': ['genshin'],
    'zenless-zone-zero': ['zzz', 'zenless'], 'wuthering-waves': ['wuwa'],
  };
  const matches = games.filter(game => [normalize(game.name), ...aliases[game.slug]].some(alias => text.includes(' ' + alias + ' ')));
  return matches.length === 1 ? matches[0] : undefined;
}

const articleUrl = (article: Article) => new URL('artigos/' + article.slug + '/', property).href;
const rank = (a: Metrics, b: Metrics) => b.impressions - a.impressions || a.keys.join(' ').localeCompare(b.keys.join(' '));

export function seoOpportunities(data: SearchConsoleReport, articles: Article[]) {
  const window = data.windows.find(item => item.days === 28)?.current;
  const byUrl = new Map(articles.map(article => [articleUrl(article), article]));
  const queryPages = new Map<string, Metrics[]>();
  const perPage = new Map<string, Metrics[]>();
  for (const row of window?.queryPages.rows ?? []) {
    const [query, page] = row.keys;
    const key = normalize(query);
    if (!key || !byUrl.has(page)) continue;
    queryPages.set(key, [...(queryPages.get(key) ?? []), row]);
    perPage.set(page, [...(perPage.get(page) ?? []), row]);
  }
  const keywords = (window?.queries.rows ?? []).filter(row => row.impressions >= 20 && row.position >= 5 && row.position <= 20)
    .sort(rank).slice(0, 100).map(row => {
      const [query] = row.keys;
      const game = gameFor(query);
      const evidence = queryPages.get(normalize(query)) ?? [];
      const matching = articles.filter(article => (!game || article.jogos.includes(game.slug)) &&
        overlap(query, article.titulo + ' ' + article.descricao) >= 0.65);
      return {
        query, metrics: row, game: game?.slug ?? null,
        measuredArticles: [...new Set(evidence.map(item => byUrl.get(item.keys[1])!.slug))],
        possibleCoverage: matching.map(article => article.slug),
      };
    });
  const conflicts = [...queryPages].flatMap(([query, rows]) => {
    const bestByPage = new Map<string, Metrics>();
    for (const row of rows.sort(rank)) {
      if (row.impressions >= 10 && row.position <= 30 && !bestByPage.has(row.keys[1])) bestByPage.set(row.keys[1], row);
    }
    return bestByPage.size >= 2 ? [{ query, pages: [...bestByPage.values()] }] : [];
  }).slice(0, 100);
  const lowCtrPages = (window?.pages.rows ?? []).filter(row => row.impressions >= 100 && row.ctr < 0.02)
    .sort(rank).slice(0, 100).map(metrics => {
      const [page] = metrics.keys;
      const article = byUrl.get(page);
      const bestQuery = perPage.get(page)?.sort(rank).find(row => row.impressions >= 10)?.keys[0];
      return {
        page, metrics, article: article?.slug ?? null, strongestQuery: bestQuery ?? null,
        currentTitle: article?.titulo ?? null, currentDescription: article?.descricao ?? null,
        review: article && bestQuery ? [
          'Compare a intenção da consulta com o conteúdo antes de alterar o título.',
          ...(overlap(bestQuery, article.titulo) < 0.65 ? ['Considere nomear no título a dúvida que o artigo resolve.'] : []),
          ...(overlap(bestQuery, article.descricao) < 0.65 ? ['Considere explicitar na descrição a resposta que o leitor encontrará.'] : []),
          'Compare o CTR com páginas em faixa de posição semelhante antes de tirar conclusões.',
        ] : ['Inspecione intenção e posição antes de propor uma alteração.'],
      };
    });
  return { keywords, conflicts, lowCtrPages };
}
