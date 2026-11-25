import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import MarkdownIt from 'markdown-it';
import { parse } from 'yaml';
import { z } from 'zod';
import { games } from './catalog';

const text = z.string().trim().min(1);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const schema = z.object({
  status: z.literal('publicado'),
  revisado: z.literal(true),
  titulo: text,
  slug,
  descricao: text,
  jogos: z.array(z.enum(games.map((game) => game.slug))).min(1),
  categoria: z.enum(['artigos', 'builds', 'tier-lists']),
  autor: text,
  publicacao: z.iso.date(),
  atualizacao: z.iso.date(),
  versao: text.optional(),
  imagem: z.string().regex(/^\/(?:[\w-]+\/)*[\w-]+\.(?:webp|png|jpe?g|avif)$/i),
  textoAlternativo: text,
  fontes: z.array(z.object({ titulo: text, url: z.url({ protocol: /^https?$/ }) })).min(1),
  relacionados: z.array(slug).default([]),
}).refine((meta) => meta.atualizacao >= meta.publicacao, 'Atualização anterior à publicação');

const markdown = new MarkdownIt({ html: false });
type Heading = { id: string; title: string; level: number };
export type Article = z.infer<typeof schema> & { html: string; headings: Heading[] };

function readArticle(file: string, publicDir: string): Article | undefined {
  const source = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(source);
  if (!match) throw new Error('Front matter YAML ausente');
  const data = parse(match[1]);
  if (data?.status === 'rascunho') return;
  const meta = schema.parse(data);
  if (!statSync(join(publicDir, meta.imagem)).isFile()) throw new Error('Imagem inválida');
  const body = source.slice(match[0].length).trim();
  if (!body) throw new Error('Artigo sem texto');
  const tokens = markdown.parse(body, {});
  const headings: Heading[] = [];
  for (const [index, token] of tokens.entries()) {
    if (token.type !== 'heading_open') continue;
    const level = Number(token.tag.slice(1));
    if (level === 1 || level > (headings.at(-1)?.level ?? 1) + 1) {
      throw new Error('Comece em ## e respeite a hierarquia de títulos');
    }
    const title = tokens[index + 1].children?.map((child) => child.content).join('') ?? '';
    const id = 'secao-' + (headings.length + 1);
    token.attrSet('id', id);
    headings.push({ id, title, level });
  }
  return { ...meta, html: markdown.renderer.render(tokens, markdown.options, {}), headings };
}

export function loadArticles(directory = join(process.cwd(), 'content/artigos'), publicDir = join(process.cwd(), 'public')) {
  const published: Article[] = [];
  const slugs = new Set<string>();
  for (const filename of readdirSync(directory).filter((name) => name.endsWith('.md'))) {
    try {
      const article = readArticle(join(directory, filename), publicDir);
      if (!article) continue;
      if (slugs.has(article.slug)) throw new Error('Slug publicado duplicado');
      slugs.add(article.slug);
      published.push(article);
    } catch (error) {
      throw new Error(`${filename}: ${error instanceof Error ? error.message : error}`);
    }
  }
  return published.sort((a, b) => b.publicacao.localeCompare(a.publicacao) || a.slug.localeCompare(b.slug));
}

export const articles = loadArticles();

export function relatedArticles(article: Article, collection = articles) {
  const candidates = collection.filter((item) => item.slug !== article.slug);
  const selected = article.relacionados.flatMap((slug) => candidates.filter((item) => item.slug === slug));
  const matches = candidates.filter((item) => item.jogos.some((game) => article.jogos.includes(game)));
  return [...new Set([...selected, ...matches])].slice(0, 3);
}
