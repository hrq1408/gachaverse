import { z } from 'zod';

export const property = 'https://gachaverse.pages.dev/';
const endpoint = 'https://www.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(property);
const day = 86_400_000;
const metrics = z.object({
  keys: z.array(z.string()).default([]),
  clicks: z.number().nonnegative(),
  impressions: z.number().nonnegative(),
  ctr: z.number().min(0).max(1),
  position: z.number().nonnegative(),
});
const count = z.union([z.string().regex(/^\d+$/), z.number().int().nonnegative().transform(String)]);
const sitemap = z.object({
  path: z.string(),
  lastSubmitted: z.string().optional(),
  lastDownloaded: z.string().optional(),
  isPending: z.boolean().optional(),
  isSitemapsIndex: z.boolean().optional(),
  type: z.string().optional(),
  errors: count.optional(),
  warnings: count.optional(),
  contents: z.array(z.object({ type: z.string(), submitted: count.optional() })).optional(),
});
export type Metrics = z.infer<typeof metrics>;

function difference(current?: Metrics, previous?: Metrics) {
  if (!current || !previous) return null;
  return {
    clicks: current.clicks - previous.clicks, impressions: current.impressions - previous.impressions,
    ctrPercentagePoints: (current.ctr - previous.ctr) * 100, position: current.position - previous.position,
  };
}

function compareRows(current: Metrics[], previous: Metrics[]) {
  const indexed = new Map(previous.map(row => [JSON.stringify(row.keys), row]));
  return current.flatMap(row => {
    const change = difference(row, indexed.get(JSON.stringify(row.keys)));
    return change ? [{ keys: row.keys, ...change }] : [];
  });
}

export function comparisonWindows(now: Date) {
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Los_Angeles', dateStyle: 'short' }).format(now);
  const end = Date.parse(date + 'T00:00:00Z') - 3 * day;
  const iso = (offset: number) => new Date(end - offset * day).toISOString().slice(0, 10);
  return [7, 28, 90].map(days => ({
    days, current: { startDate: iso(days - 1), endDate: iso(0) },
    previous: { startDate: iso(2 * days - 1), endDate: iso(days) },
  }));
}

function searchConsoleReader(token: string, request: typeof fetch) {
  if (!token.trim()) throw new Error('Configure um token temporário do Search Console.');
  async function read(path: string, body?: object) {
    const response = await request(endpoint + path, {
      method: body ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(20_000),
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: body && JSON.stringify(body),
    }).catch(() => { throw new Error('Falha de rede na API do Search Console.'); });
    if (!response.ok) throw new Error('Search Console retornou HTTP ' + response.status + ' em ' + path + '.');
    return await response.json().catch(() => { throw new Error('Resposta inválida do Search Console.'); });
  }
  return read;
}

type Filter = { dimension: 'page' | 'country'; operator: 'equals' | 'includingRegex' | 'excludingRegex'; expression: string };
const dimensions = { total: [], queries: ['query'], pages: ['page'], queryPages: ['query', 'page'] } as const;

function analyticsPeriod(read: ReturnType<typeof searchConsoleReader>, filters: Filter[]) {
  return async function period(range: { startDate: string; endDate: string }) {
    const breakdowns = {} as Record<keyof typeof dimensions, { rows: Metrics[]; reachedRowLimit: boolean }>;
    for (const key of Object.keys(dimensions) as (keyof typeof dimensions)[]) {
      const rowLimit = key === 'total' ? 1 : 5_000;
      const raw = await read('/searchAnalytics/query', {
        ...range, type: 'web', dataState: 'final', dimensions: dimensions[key], rowLimit,
        dimensionFilterGroups: [{ filters }],
      });
      const result = z.object({ rows: z.array(metrics).default([]) }).safeParse(raw);
      if (!result.success || result.data.rows.some(row => row.keys.length !== dimensions[key].length)) {
        throw new Error('Métricas do Search Console em formato inesperado.');
      }
      breakdowns[key] = { rows: result.data.rows, reachedRowLimit: key !== 'total' && result.data.rows.length === rowLimit };
    }
    return { ...range, ...breakdowns };
  };
}

export async function collectSearchConsole(token: string, now: Date, request = fetch) {
  const read = searchConsoleReader(token, request);
  const period = analyticsPeriod(read, [{ dimension: 'country', operator: 'equals', expression: 'bra' }]);
  const windows = [];
  for (const window of comparisonWindows(now)) {
    const current = await period(window.current);
    const previous = await period(window.previous);
    windows.push({ days: window.days, current, previous, comparison: difference(current.total.rows[0], previous.total.rows[0]),
      queryChanges: compareRows(current.queries.rows, previous.queries.rows),
      pageChanges: compareRows(current.pages.rows, previous.pages.rows),
    });
  }
  const sitemaps = z.object({ sitemap: z.array(sitemap).default([]) }).safeParse(await read('/sitemaps'));
  if (!sitemaps.success) throw new Error('Status de sitemaps em formato inesperado.');
  return { property, country: 'BRA', windows, sitemaps: sitemaps.data.sitemap };
}

export type SearchConsoleReport = Awaited<ReturnType<typeof collectSearchConsole>>;

export function parseInternationalMarkets(input = 'en:usa,es:mex') {
  const settings = new Set(['en:all', 'es:all', ...input.split(',').map(pair => pair.trim().toLowerCase()).filter(Boolean)]);
  if (settings.size > 8) throw new Error('Limite de oito recortes internacionais por coleta.');
  return [...settings].map(pair => {
    const [locale, country] = pair.split(':');
    if (!/^(?:en|es|pt-br):(?:[a-z]{3}|all)$/.test(pair)) throw new Error('Use combinações idioma:país ISO alfa-3.');
    return { locale, country: country === 'all' ? null : country.toUpperCase() };
  });
}

export async function collectInternationalSearchConsole(token: string, now: Date,
  markets = parseInternationalMarkets(), request = fetch) {
  const read = searchConsoleReader(token, request);
  const window = comparisonWindows(now).find(item => item.days === 28)!;
  const reports = [];
  for (const market of markets) {
    const filter: Filter = { dimension: 'page', operator: market.locale === 'pt-br' ? 'excludingRegex' : 'includingRegex',
      expression: '^https://gachaverse\\.pages\\.dev/' + (market.locale === 'pt-br' ? '(en|es)' : market.locale) + '/' };
    const period = analyticsPeriod(read, [filter, ...(market.country ? [
      { dimension: 'country' as const, operator: 'equals' as const, expression: market.country.toLowerCase() },
    ] : [])]);
    try {
      const current = await period(window.current);
      const previous = await period(window.previous);
      reports.push({ ...market, status: 'available' as const, days: window.days, current, previous,
        comparison: difference(current.total.rows[0], previous.total.rows[0]),
        queryChanges: compareRows(current.queries.rows, previous.queries.rows), pageChanges: compareRows(current.pages.rows, previous.pages.rows),
      });
    } catch {
      reports.push({ ...market, status: 'unavailable' as const });
      break;
    }
  }
  return reports;
}
