import { mkdtemp, realpath, readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { articles } from '../src/content/articles';
import { officialChannels, scanFeeds } from './redemption-sources';
import { collectSearchConsole } from './editorial-intelligence/search-console';
import { seoOpportunities } from './editorial-intelligence/opportunities';
import { editorialQueue } from './editorial-intelligence/queue';
import { importTrends } from './editorial-intelligence/trends';

const md = (value: string) => value.replace(/[\r\n]/g, ' ').replace(/[&<>"'`*_[\]~|!\\]/g,
  char => '&#' + char.charCodeAt(0) + ';');
const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const n = (value: number) => number.format(value);

async function main() {
  const { values } = parseArgs({ options: {
    public: { type: 'boolean' }, out: { type: 'string' }, trends: { type: 'string' },
    'skip-youtube': { type: 'boolean' },
  } });
  if (values.public && (values.out || values.trends)) throw new Error('O modo público aceita somente o resumo de fontes públicas.');
  if (process.env.GITHUB_ACTIONS === 'true' && !values.public &&
      (process.env.GACHAVERSE_PRIVATE_WORKFLOW !== 'true' || process.env.GITHUB_REPOSITORY !== 'hrq1408/gachaverse-intelligence' ||
       process.env.GITHUB_REPOSITORY_ID !== '1473633500' || process.env.GITHUB_REF !== 'refs/heads/main')) {
    throw new Error('Relatórios detalhados exigem o workflow em um repositório privado.');
  }
  let output: string | undefined;
  if (!values.public) {
    if (!values.out || !isAbsolute(values.out)) throw new Error('Informe --out com um diretório existente, absoluto e fora do repositório.');
    output = await realpath(values.out);
    const fromRoot = relative(await realpath(process.cwd()), output);
    if (!isAbsolute(fromRoot) && fromRoot !== '..' && !fromRoot.startsWith('..' + sep)) {
      throw new Error('Relatórios detalhados devem ficar fora do repositório.');
    }
  }

  const now = new Date();
  const token = values.public ? undefined : process.env.GSC_ACCESS_TOKEN;
  const searchConsole = token ? await collectSearchConsole(token, now) : null;
  const trends = values.trends ? importTrends(await readFile(values.trends, 'utf8')) : null;
  const apiOnly = Boolean(process.env.YOUTUBE_DATA_API_KEY);
  const sources = values['skip-youtube'] ? null : await scanFeeds(apiOnly).catch(() => ({
    announcements: [], failures: Object.keys(officialChannels),
  }));
  const seo = searchConsole ? seoOpportunities(searchConsole, articles) : null;
  const queue = editorialQueue(articles, sources?.announcements ?? [], now, seo ?? undefined, trends ?? undefined);
  const report = {
    generatedAt: now.toISOString(), catalogArticles: articles.length,
    searchConsole, seo, trends, youtube: sources ? { mode: apiOnly ? 'api' : 'atom',
      videosChecked: sources.announcements.length, unavailableGames: sources.failures } : null,
    queue,
  };
  const lines = ['# GachaVerse Editorial Intelligence', '', 'Artigos publicados analisados — ' + articles.length,
    'Coleta YouTube — ' + (report.youtube ? report.youtube.mode + ', ' + report.youtube.videosChecked + ' vídeos' : 'não executada'),
    'Canais sem coleta confirmada — ' + (report.youtube?.unavailableGames.join(', ') || (report.youtube ? 'nenhum' : 'coleta não executada')),
    'Pautas para revisão — ' + queue.length];
  if (!output) { console.log(lines.join('\n')); return; }
  lines.push('', '## Search Console — resultados da Pesquisa Web no Brasil', '');
  if (!searchConsole) lines.push('Coleta não executada. Nenhuma métrica inferida.');
  for (const window of searchConsole?.windows ?? []) {
    lines.push('', '### ' + window.days + ' dias', '');
    for (const [label, period] of [['Atual', window.current], ['Anterior', window.previous]] as const) {
      const row = period.total.rows[0];
      lines.push('- ' + label + ' (' + period.startDate + ' a ' + period.endDate + ') — ' + (row ?
        n(row.clicks) + ' cliques, ' + n(row.impressions) + ' impressões, CTR ' + n(row.ctr * 100) +
        '%, posição média ' + n(row.position) : 'sem linhas disponíveis'));
      if ([period.queries, period.pages, period.queryPages].some(item => item.reachedRowLimit)) lines.push('- Limite local de linhas atingido.');
    }
    const delta = window.comparison;
    if (delta) lines.push('- Variação atual − anterior — ' + n(delta.clicks) + ' cliques, ' + n(delta.impressions) +
      ' impressões, ' + n(delta.ctrPercentagePoints) + ' p.p. de CTR, ' + n(delta.position) + ' de posição média.');
  }
  lines.push('', '### Sitemaps', '');
  if (!searchConsole?.sitemaps.length) lines.push('Sem registros disponíveis neste relatório.');
  for (const sitemap of searchConsole?.sitemaps ?? []) {
    const state = sitemap.isPending === undefined ? 'estado indisponível' : sitemap.isPending ? 'pendente' : 'sem indicação de pendência';
    lines.push('- ' + md(sitemap.path) + ' — ' + state +
      ', última leitura ' + md(sitemap.lastDownloaded ?? 'indisponível') + ', erros ' + md(sitemap.errors ?? 'indisponíveis'));
  }
  lines.push('', '## Oportunidades observadas em 28 dias', '',
    'Os limiares são critérios de triagem. O JSON contém as linhas de evidência e os dados comparativos.', '');
  for (const item of seo?.keywords ?? []) lines.push('- Consulta **' + md(item.query) + '** — posição ' +
    n(item.metrics.position) + ', ' + n(item.metrics.impressions) + ' impressões.');
  for (const item of seo?.conflicts ?? []) lines.push('- Possível sobreposição para **' + md(item.query) + '** em ' + item.pages.length + ' artigos.');
  for (const item of seo?.lowCtrPages ?? []) lines.push('- CTR de ' + n(item.metrics.ctr * 100) + '% em ' +
    md(item.page) + ' — ' + item.review.map(md).join(' '));
  lines.push('', '## Fila editorial', '');
  for (const brief of queue) lines.push('- **' + md(brief.title) + '** — ' + brief.priority + ', ' +
    brief.evidence + ', ' + brief.action + ', ' + brief.reviewStatus + '.');
  if (!queue.length) lines.push('Nenhuma pauta encontrada com os critérios desta execução.');
  const folder = await mkdtemp(join(output, 'relatorio-'));
  await writeFile(join(folder, 'inteligencia-editorial.json'), JSON.stringify(report, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  await writeFile(join(folder, 'inteligencia-editorial.md'), lines.join('\n') + '\n', { mode: 0o600, flag: 'wx' });
  console.log('Relatórios editoriais gerados.');
}

main().catch(error => {
  // Nunca imprime respostas, caminhos locais, consultas ou credenciais.
  console.error(error instanceof Error && /^(Configure um token|Falha de rede|Search Console retornou|Coleta |Métricas do|Status de sitemaps)/.test(error.message)
    ? error.message : 'A inteligência editorial não pôde concluir a execução. Confira as opções, arquivos e acessos no guia.');
  process.exitCode = 1;
});
