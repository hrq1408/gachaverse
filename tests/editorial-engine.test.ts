import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parse } from 'yaml';
import { articles, publicPaths } from '../src/content/editorial';
import { approvalSchema, authorizePublication, bareBody, briefSchema, checkBrief, renderDraft, reviewDigest } from '../scripts/editorial-engine/draft';
import { publicYoutubeSnapshot, readYoutubeSnapshot } from '../scripts/editorial-intelligence/youtube-snapshot';
import type { OfficialVideo } from '../scripts/redemption-sources';

const dates = '2026-11-26';
const paths = new Set(publicPaths());
const prefix = 'docs/editorial-engine/pautas/';
const slug = 'honkai-star-rail-reliquias';
const original = readFileSync('content/artigos/' + slug + '.md', 'utf8');
const brief = { ...briefSchema.parse(JSON.parse(readFileSync(prefix + slug + '.json', 'utf8'))), status: 'em-revisao' as const };
const sections = readFileSync(prefix + slug + '.md', 'utf8');
const body = [brief.intro, bareBody(original), sections].join('\n\n');

test('uma atualização mantém o slug, fontes anteriores e data original; o rascunho fica fora do portal', () => {
  const target = checkBrief(brief, body, articles, paths, dates);
  const yaml = (draft: string) => parse(draft.split('---\n')[1]);
  const draft = yaml(renderDraft(brief, body, target));
  assert.equal(draft.slug, slug);
  assert.equal(draft.publicacao, target?.publicacao);
  assert.equal(draft.status, 'rascunho');
  assert.equal(draft.revisado, false);
  assert.equal(draft.fontes.length, new Set([...(target?.fontes ?? []), ...brief.sources].map(item => item.url)).size);
  assert.throws(() => checkBrief({ ...brief, type: 'nova' }, body, articles, paths, dates), /duplicata/);
  assert.throws(() => checkBrief(brief, body + '\n[quebrado](/pagina-inexistente/)', articles, paths, dates), /fora do catálogo/);
  assert.equal(articles.filter(item => item.slug === 'genshin-impact-cross-save').length, 1);
});

test('associa a pauta ao relatório e exige aprovação humana da revisão exata', () => {
  const id = '1'.repeat(20);
  const linked = { ...brief, intelligenceId: id };
  assert.throws(() => checkBrief(linked, body, articles, paths, dates), /oportunidade/);
  const target = checkBrief(linked, body, articles, paths, dates, {
    queue: [{ id, slug, game: brief.game, action: 'revisar artigo existente' }],
  });
  const draft = renderDraft(brief, body, target);
  const digest = reviewDigest(brief, draft, Buffer.from('capa'), original);
  const approval = approvalSchema.parse({ id: brief.id, digest, reviewer: 'Revisor do teste',
    date: dates, status: 'aprovada', coverChecked: true, sourcesChecked: true });
  assert.equal(authorizePublication(approval, brief, digest, dates, target), dates);
  assert.throws(() => authorizePublication(approval, brief, reviewDigest(brief, draft, Buffer.from('outra'), original), dates, target),
    /corresponder/);
  assert.throws(() => authorizePublication(approval, brief, digest, '2026-11-27', target), /data efetiva/);
  const published = renderDraft(brief, body, target, dates);
  assert.match(published, /status: publicado/);
  assert.match(published, /revisado: true/);
});

test('compartilha só metadados públicos e rejeita snapshots antigos ou campos extras', () => {
  const now = new Date('2026-11-26T13:00:00Z');
  const video: OfficialVideo = { game: 'genshin-impact', id: 'x'.repeat(11), title: 'Programa especial',
    description: 'Conteúdo que não deve entrar no artifact', publishedAt: '2026-11-25T13:00:00Z' };
  const snapshot = publicYoutubeSnapshot([video, video], ['zenless-zone-zero'], now);
  assert.equal(snapshot.videos.length, 1);
  assert.doesNotMatch(JSON.stringify(snapshot), /description|não deve entrar/);
  assert.equal(readYoutubeSnapshot(snapshot, now)?.announcements[0].id, video.id);
  assert.deepEqual(readYoutubeSnapshot(snapshot, now)?.failures, ['zenless-zone-zero']);
  assert.equal(readYoutubeSnapshot(snapshot, new Date('2026-11-29T13:00:00Z')), null);
  assert.equal(readYoutubeSnapshot({ ...snapshot, token: 'campo inesperado' }, now), null);
});

test('o produtor publica somente o snapshot e o consumidor privado não recebe a chave YouTube', () => {
  const privateSteps = parse(readFileSync('.github/workflows/inteligencia-editorial.yml', 'utf8')).jobs['relatorios-privados'].steps;
  const read = privateSteps.find((step: { name: string }) => step.name === 'Obter o snapshot público do YouTube');
  assert.match(read.env.GH_TOKEN, /secrets\.EDITORIAL_YOUTUBE_ARTIFACT_TOKEN/);
  assert.doesNotMatch(JSON.stringify(privateSteps), /YOUTUBE_DATA_API_KEY/);
  const producerSteps = parse(readFileSync('.github/workflows/codigos.yml', 'utf8')).jobs.auditoria.steps;
  const artifact = producerSteps.find((step: { with?: { name: string } }) => step.with?.name === 'youtube-publico');
  assert.equal(artifact.with.path, '${{ runner.temp }}/youtube-publico.json');
});
