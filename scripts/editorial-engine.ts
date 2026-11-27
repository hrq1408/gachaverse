import { mkdir, mkdtemp, readdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { articles, publicPaths } from '../src/content/editorial';
import { loadArticles } from '../src/content/articles';
import { sourceRevision, translationBatches, translationQueue } from '../src/i18n/articles';
import { translatedLocales } from '../src/i18n/locales';
import { approvalSchema, authorizePublication, bareBody, briefSchema, checkBrief, intelligenceSchema, renderDraft, reviewDigest, similar } from './editorial-engine/draft';

const workspace = 'docs/editorial-engine';
const json = async (path: string): Promise<unknown> => JSON.parse(await readFile(path, 'utf8'));
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo', dateStyle: 'short' }).format(new Date());

async function main() {
  const { values } = parseArgs({ options: {
    out: { type: 'string' }, report: { type: 'string' }, approval: { type: 'string' },
    select: { type: 'boolean' },
    briefs: { type: 'string' }, covers: { type: 'string' }, translations: { type: 'boolean' }, 'translation-batches': { type: 'boolean' },
  } });
  if (values.translations || values['translation-batches']) {
    if (Object.keys(values).length !== 1) throw new Error('Use uma opção de traduções por vez.');
    console.log(JSON.stringify(values.translations ? translationQueue() : translationBatches(), null, 2));
    return;
  }
  if ((values.report || values.approval) && (!values.out || !isAbsolute(values.out))) {
    throw new Error('Use --out com um diretório absoluto fora do checkout ao importar relatórios ou preparar uma publicação.');
  }
  if (values.out && !isAbsolute(values.out)) throw new Error('Use um caminho absoluto em --out.');
  const output = await realpath(values.out ?? join(workspace, 'revisao'));
  const checkout = await realpath(process.cwd());
  const fromRoot = relative(checkout, output);
  const outside = isAbsolute(fromRoot) || fromRoot === '..' || fromRoot.startsWith('..' + sep);
  if (!outside && (values.out || values.report || values.approval)) throw new Error('A saída explícita deve ficar fora do checkout.');

  const intake = values.briefs ?? join(workspace, 'pautas');
  const covers = values.covers ?? join(workspace, 'capas');
  const files = (await readdir(intake)).filter(file => file.endsWith('.json')).sort();
  const briefs = await Promise.all(files.map(async file => briefSchema.parse(await json(join(intake, file)))));
  const intelligence = values.report ? intelligenceSchema.parse(await json(values.report)) : undefined;
  if (values.select) {
    if (!intelligence || values.approval) throw new Error('Use --select com --report e uma saída privada.');
    const existingIds = new Set(briefs.map(brief => brief.intelligenceId).filter(Boolean));
    const existing = new Set(briefs.map(brief => brief.slug));
    const next = intelligence.queue.find(candidate => !existingIds.has(candidate.id) && !existing.has(candidate.slug));
    if (!next) {
      console.log('Nenhuma nova pauta elegível no relatório.');
      return;
    }
    const folder = await mkdtemp(join(output, 'selecao-'));
    await writeFile(join(folder, 'pauta.json'), JSON.stringify({ ...next, translations: translatedLocales }, null, 2) + '\n',
      { flag: 'wx', mode: 0o600 });
    console.log('Uma pauta foi selecionada para revisão privada.');
    return;
  }
  const active = briefs.filter(brief => brief.status === 'pendente' || brief.status === 'em-revisao');
  if (active.some((brief, index) => active.slice(index + 1).some(other => brief.id === other.id || brief.slug === other.slug ||
    (brief.game === other.game && similar(brief.title, other.title, 0.8))))) throw new Error('Possível duplicata na fila.');
  const approval = values.approval ? approvalSchema.parse(await json(values.approval)) : undefined;
  const selected = active.filter(brief => !approval || brief.id === approval.id);
  if (!selected.length) {
    if (approval) throw new Error('Nenhuma pauta ativa corresponde à aprovação.');
    console.log('Nenhuma pauta ativa. O histórico de revisão foi preservado.');
    return;
  }
  const paths = new Set(publicPaths());
  const prepared = await Promise.all(selected.map(async brief => {
    const previous = brief.type === 'atualizacao' ? await readFile(join('content/artigos', brief.slug + '.md'), 'utf8') : '';
    const sections = await readFile(join(intake, brief.id + '.md'), 'utf8');
    const body = [brief.intro, previous && !brief.revisionMode && bareBody(previous), sections.trim()].filter(Boolean).join('\n\n');
    const target = checkBrief(brief, body, articles, paths, today, intelligence);
    const cover = await readFile(join(covers, brief.cover.file));
    if (cover[0] !== 0xff || cover[1] !== 0xd8 || cover[2] !== 0xff) throw new Error('A capa deve ser um JPEG válido.');
    const draft = renderDraft(brief, body, target);
    const digest = reviewDigest(brief, draft, cover, previous);
    const approvedDate = approval && authorizePublication(approval, brief, digest, today, target);
    return { brief, cover, digest, markdown: approvedDate ? renderDraft(brief, body, target, approvedDate) : draft };
  }));
  if (approval) {
    const folder = await mkdtemp(join(output, 'publicacao-'));
    const [item] = prepared;
    const posts = join(folder, 'content/artigos');
    const images = join(folder, 'public/images/artigos');
    await mkdir(posts, { recursive: true });
    await mkdir(images, { recursive: true });
    await writeFile(join(posts, item.brief.slug + '.md'), item.markdown, { flag: 'wx' });
    await writeFile(join(images, item.brief.cover.file), item.cover, { flag: 'wx' });
    const article = loadArticles(posts, join(folder, 'public'))[0];
    if (article?.slug !== item.brief.slug) {
      throw new Error('O candidato aprovado não passou pelo carregador do portal.');
    }
    const proposals = translatedLocales.map(locale => ({
      editorialId: article.slug, locale, sourceLocale: 'pt-BR', sourceRevision: sourceRevision(article),
      status: 'revisão exigida', image: article.imagem, sources: article.fontes,
    }));
    await writeFile(join(folder, 'traducoes.json'), JSON.stringify(proposals, null, 2) + '\n', { flag: 'wx' });
    console.log('Candidato aprovado preparado fora do checkout em ' + folder);
    return;
  }
  for (const item of prepared) await writeFile(join(output, item.brief.slug + '.md'), item.markdown);
  const review = prepared.map(({ brief, digest }) => ({
    id: brief.id, slug: brief.slug, type: brief.type, status: brief.status, priority: brief.priority,
    title: brief.title, description: brief.description, game: brief.game, keyword: brief.keyword, secondary: brief.secondary,
    intent: brief.intent, digest, sources: brief.sources, cover: brief.cover, socials: brief.socials,
    translations: translatedLocales.map(locale => ({
      editorialId: brief.slug, locale, sourceLocale: 'pt-BR', status: 'aguarda revisão do original',
    })),
  }));
  await writeFile(join(output, 'fila.json'), JSON.stringify(review, null, 2) + '\n');
  const social = prepared.map(({ brief }) => [
    '## ' + brief.title, '', '### Instagram', '', brief.socials.instagram, '',
    '### TikTok', '', brief.socials.tiktok, '', '### X', '', brief.socials.x,
  ].join('\n'));
  await writeFile(join(output, 'divulgacao.md'), '# Textos para revisão antes da divulgação\n\n' +
    'Substitua a chamada provisória pelo link canônico depois da publicação.\n\n' + social.join('\n\n') + '\n');
  console.log(prepared.length + ' rascunho(s) gerado(s) para revisão.');
}

main().catch((error: unknown) => {
  if (process.argv.includes('--report')) console.error('Falha ao preparar pauta com relatório privado. Confira os arquivos em ambiente autorizado.');
  else console.error(error instanceof Error ? error.message : 'Falha no Editorial Engine.');
  process.exitCode = 1;
});
