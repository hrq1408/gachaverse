import { createHash } from 'node:crypto';
import MarkdownIt from 'markdown-it';
import { stringify } from 'yaml';
import { z } from 'zod';
import { games } from '../../src/content/catalog';
import type { Article } from '../../src/content/articles';
import { normalize, overlap } from '../editorial-intelligence/opportunities';

const text = z.string().trim().min(1);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const officialHosts = new Set([
  'support.hoyoverse.com', 'hsr.hoyoverse.com', 'genshin.hoyoverse.com',
  'zenless.hoyoverse.com', 'wutheringwaves.kurogames.com',
]);
const source = z.object({
  title: text, url: z.url({ protocol: /^https$/ }).refine(value => {
    const url = new URL(value);
    return officialHosts.has(url.hostname) && !url.username && !url.password && !url.port && url.pathname !== '/';
  }, 'Use uma página específica de um domínio oficial aceito.'),
  checkedOn: z.iso.date(), supports: text,
}).strict();

export const briefSchema = z.object({
  id: slug, intelligenceId: z.string().regex(/^[a-f0-9]{20}$/).optional(),
  status: z.enum(['pendente', 'em-revisao', 'rejeitada', 'publicada']),
  type: z.enum(['nova', 'atualizacao']), slug, game: z.enum(games.map(game => game.slug)),
  revisionMode: z.literal('substituir').optional(),
  title: text.max(120), description: text.max(165), keyword: text, secondary: z.array(text),
  intent: text, priority: z.enum(['alta', 'média', 'baixa']),
  author: text, intro: text, related: z.array(slug).min(1),
  sources: z.array(source).min(2),
  cover: z.object({ file: z.string().regex(/^[a-z0-9-]+\.jpg$/), alt: text, credit: text, prompt: text }),
  socials: z.object({ instagram: text, tiktok: text, x: text.max(280) }),
}).strict();

export const intelligenceSchema = z.object({
  queue: z.array(z.object({ id: z.string(), game: z.string(), slug: z.string(), action: z.string() })),
});
export const approvalSchema = z.object({
  id: slug, digest: z.string().regex(/^[a-f0-9]{64}$/), reviewer: text, date: z.iso.date(),
  status: z.literal('aprovada'), sourcesChecked: z.literal(true), coverChecked: z.literal(true),
  mode: z.enum(['manual', 'codex']).optional(),
  evidence: z.object({
    verifiedFacts: z.array(text).min(1),
    coverRights: text,
    languageReview: text,
  }).strict().optional(),
}).strict().refine(approval => approval.mode !== 'codex' || Boolean(approval.evidence),
  'A revisão pelo Codex exige evidências factuais, direitos da capa e revisão de idioma.');
export type Brief = z.infer<typeof briefSchema>;
type Approval = z.infer<typeof approvalSchema>;
export const bareBody = (raw: string) => raw.replace(/\r\n/g, '\n').replace(/^---\n[\s\S]*?\n---\n/, '').trim();
const md = new MarkdownIt({ html: false });

export const similar = (left: string, right: string, threshold: number) =>
  overlap(left, right) >= threshold && overlap(right, left) >= threshold;

export function checkBrief(brief: Brief, body: string, articles: Article[], paths: Set<string>, today: string,
  intelligence?: z.infer<typeof intelligenceSchema>) {
  const target = articles.find(article => article.slug === brief.slug);
  if (brief.status === 'rejeitada') throw new Error('Pauta rejeitada.');
  if (brief.type === 'atualizacao' && (!target || !target.jogos.includes(brief.game) || target.categoria !== 'artigos')) {
    throw new Error('A atualização exige o slug de um artigo publicado da categoria e do jogo.');
  }
  if (brief.type === 'nova' && (target || articles.some(article => article.jogos.includes(brief.game) &&
      (normalize(article.titulo) === normalize(brief.title) ||
       similar(brief.title, article.titulo, 0.8) ||
       similar(body, article.html.replace(/<[^>]*>/g, ' '), 0.9))))) {
    throw new Error('Possível duplicata. Avalie atualizar o artigo existente.');
  }
  if (brief.intelligenceId && !intelligence?.queue.some(row => row.id === brief.intelligenceId && row.game === brief.game &&
      row.slug === brief.slug && row.action === (target ? 'revisar artigo existente' : 'nova pauta'))) {
    throw new Error('A pauta não corresponde à oportunidade do relatório selecionado.');
  }
  if (new Set(brief.sources.map(item => item.url)).size !== brief.sources.length || brief.sources.some(item => item.checkedOn > today)) {
    throw new Error('Confira URLs de fonte distintas e datas reais de consulta.');
  }
  if (brief.related.some(id => id === brief.slug || !paths.has('/artigos/' + id + '/'))) throw new Error('Relacionado inválido.');
  const tokens = md.parse(body, {});
  let level = 1;
  let headings = 0;
  for (const token of tokens) {
    if (token.type === 'heading_open') {
      const next = Number(token.tag.slice(1));
      if (next < 2 || next > level + 1) throw new Error('Comece em ## e respeite a hierarquia dos subtítulos.');
      level = next;
      headings++;
    }
    for (const child of token.children ?? []) {
      if (child.type !== 'link_open') continue;
      const href = child.attrGet('href');
      if (typeof href !== 'string' || (!(href.startsWith('/') && paths.has(href)) &&
          !brief.sources.some(item => item.url === href) && !target?.fontes.some(item => item.url === href))) {
        throw new Error('Link do corpo fora do catálogo ou das fontes registradas.');
      }
    }
  }
  if (headings < 3 || !tokens.some(token => token.type === 'paragraph_open')) {
    throw new Error('O rascunho precisa de conteúdo e pelo menos três subtítulos.');
  }
  return target;
}

export function renderDraft(brief: Brief, body: string, target?: Article, publicationDate?: string) {
  const sources = new Map((target?.fontes ?? []).map(item => [item.url, item]));
  for (const item of brief.sources) sources.set(item.url, { titulo: item.title, url: item.url });
  const metadata = {
    status: publicationDate ? 'publicado' : 'rascunho', revisado: Boolean(publicationDate),
    titulo: brief.title, slug: brief.slug, descricao: brief.description,
    jogos: target?.jogos ?? [brief.game], categoria: 'artigos',
    autor: target?.autor ?? brief.author,
    ...(target?.versao ? { versao: target.versao } : {}),
    ...(target || publicationDate ? {
      publicacao: target?.publicacao ?? publicationDate,
      atualizacao: publicationDate ?? target?.atualizacao,
    } : {}),
    imagem: '/images/artigos/' + brief.cover.file,
    textoAlternativo: brief.cover.alt, legendaImagem: brief.cover.credit,
    fontes: [...sources.values()], relacionados: [...new Set([...(target?.relacionados ?? []), ...brief.related])],
  };
  return '---\n' + stringify(metadata, { lineWidth: 0 }) + '---\n\n' + body.trim() + '\n';
}

export function reviewDigest(brief: Brief, draft: string, cover: Buffer, previous: string) {
  return createHash('sha256').update(JSON.stringify([brief, draft, previous.replace(/\r\n/g, '\n')]))
    .update(cover).digest('hex');
}

export function authorizePublication(approval: Approval, brief: Brief, digest: string, today: string, target?: Article) {
  if (brief.status !== 'em-revisao' || approval.id !== brief.id || approval.digest !== digest || approval.date !== today ||
      (target && approval.date < target.atualizacao)) {
    throw new Error('A aprovação precisa corresponder ao conteúdo atual e à data efetiva da publicação.');
  }
  return approval.date;
}
