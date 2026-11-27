import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import MarkdownIt from 'markdown-it';
import { parse } from 'yaml';
import { z } from 'zod';
import { articles, type Article } from '@/content/articles';
import { publicPaths } from '@/content/editorial';
import { guidesPath, languageAlternates, translatedLocales, type TranslationLocale } from './locales';
import { toolPages, toolPath } from './tools';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const text = z.string().trim().min(1);
const schema = z.object({
  editorialId: slug, slug, status: z.enum(['draft', 'published']), reviewed: z.boolean(),
  sourceRevision: z.string().regex(/^[a-f0-9]{64}$/), title: text.max(130),
  description: text.max(170), imageAlt: text,
}).strict();
const markdown = new MarkdownIt({ html: false });
const portuguesePaths = new Set(publicPaths());

export function sourceRevision(source: Article) {
  const { titulo, descricao, publicacao, atualizacao, fontes, imagem, versao, autor, jogos, categoria, html } = source;
  return createHash('sha256').update(JSON.stringify({ titulo, descricao, publicacao, atualizacao, fontes, imagem, versao, autor, jogos, categoria, html }))
    .digest('hex');
}

export function readTranslation(raw: string, locale: TranslationLocale, collection: Article[]) {
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(raw.replace(/\r\n/g, '\n'));
  if (!match) throw new Error('Front matter da tradução ausente.');
  const meta = schema.parse(parse(match[1]));
  const source = collection.find(article => article.slug === meta.editorialId);
  if (!source) throw new Error('Identificador editorial sem referência publicada em português.');
  const body = raw.replace(/\r\n/g, '\n').slice(match[0].length).trim();
  if (!body) throw new Error('Tradução sem texto.');
  const tokens = markdown.parse(body, {});
  const headings: Article['headings'] = [];
  for (const [index, token] of tokens.entries()) {
    for (const child of token.children ?? []) {
      if (child.type !== 'link_open') continue;
      const href = child.attrGet('href');
      if (typeof href === 'string' && href.startsWith('/')) {
        if (portuguesePaths.has(href)) child.attrSet('hreflang', 'pt-BR');
        else if (!toolPages.some(page => toolPath(page, locale) === href)) {
          throw new Error('Link interno sem destino público no português ou no idioma da tradução.');
        }
      }
    }
    if (token.type !== 'heading_open') continue;
    const level = Number(token.tag.slice(1));
    if (level < 2 || level > (headings.at(-1)?.level ?? 1) + 1) throw new Error('Use subtítulos a partir de H2.');
    const id = 'section-' + (headings.length + 1);
    token.attrSet('id', id);
    headings.push({ id, title: tokens[index + 1].content, level });
  }
  if (!headings.length) throw new Error('Tradução sem subtítulos.');
  if (meta.status === 'published' && !meta.reviewed) throw new Error('A publicação da tradução exige revisão explícita.');
  const stale = meta.sourceRevision !== sourceRevision(source);
  const article: Article = { ...source, slug: meta.slug, titulo: meta.title, descricao: meta.description,
    textoAlternativo: meta.imageAlt, headings, html: markdown.renderer.render(tokens, markdown.options, {}) };
  return { ...meta, locale, source, article, stale, indexable: meta.status === 'published' && !stale };
}

export type Translation = ReturnType<typeof readTranslation>;
export const translationPath = (entry: Pick<Translation, 'locale' | 'slug'>) => guidesPath(entry.locale) + entry.slug + '/';

export function loadTranslations(root = join(process.cwd(), 'content/traducoes'), collection = articles) {
  return translatedLocales.flatMap(locale => {
    const directory = join(root, locale);
    const rows = readdirSync(directory).filter(file => file.endsWith('.md')).map(file => {
      try { return readTranslation(readFileSync(join(directory, file), 'utf8'), locale, collection); }
      catch (error) { throw new Error(locale + '/' + file + ' — ' + (error instanceof Error ? error.message : 'tradução inválida')); }
    });
    if (new Set(rows.map(row => row.slug)).size !== rows.length ||
        new Set(rows.map(row => row.editorialId)).size !== rows.length) throw new Error('Slug ou identificador editorial repetido em ' + locale);
    return rows;
  });
}

export const translations = loadTranslations();
export const publishedTranslations = translations.filter(entry => entry.indexable);
export const reviewTranslations = process.env.I18N_REVIEW_BUILD === 'true';

export function articleAlternates(editorialId: string, entries = publishedTranslations) {
  const paths: Partial<Record<'pt-BR' | TranslationLocale, string>> = { 'pt-BR': '/artigos/' + editorialId + '/' };
  for (const entry of entries) {
    if (entry.indexable && entry.editorialId === editorialId) paths[entry.locale] = translationPath(entry);
  }
  return languageAlternates(paths);
}

export function articleSwitchMap() {
  return Object.fromEntries(articles.flatMap(article => {
    const paths = articleAlternates(article.slug);
    if (!paths.en && !paths.es) return [];
    return Object.entries(paths).filter(([locale]) => locale !== 'x-default').map(([, path]) => [path, paths]);
  }));
}

export function translationQueue() {
  return articles.flatMap(source => translatedLocales.map(locale => {
    const entry = translations.find(row => row.editorialId === source.slug && row.locale === locale);
    return {
      editorialId: source.slug, locale, title: source.titulo, sourcePath: '/artigos/' + source.slug + '/',
      sourceRevision: sourceRevision(source),
      image: source.imagem, sources: source.fontes, games: source.jogos,
      status: entry ? entry.stale ? 'desatualizada' : entry.indexable ? 'publicada' : 'em revisão' : 'pendente',
      draftPath: entry ? 'content/traducoes/' + locale + '/' + entry.slug + '.md' : null,
    };
  }));
}

const first = [
  'honkai-star-rail-pity-50-50', 'genshin-impact-pity-oracoes', 'zenless-zone-zero-canais-garantia',
  'wuthering-waves-banners-garantias', 'honkai-star-rail-guia-iniciantes', 'genshin-impact-guia-iniciantes',
  'zenless-zone-zero-guia-iniciantes', 'wuthering-waves-guia-iniciantes',
];

export function translationBatches(size = 4) {
  const pending = translationQueue().filter(row => row.status === 'pendente' || row.status === 'desatualizada');
  const rank = (id: string) => first.includes(id) ? first.indexOf(id) : first.length;
  const ids = [...new Set(pending.map(row => row.editorialId))].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  return Array.from({ length: Math.ceil(ids.length / size) }, (_, index) => ({
    batch: index + 1,
    rows: pending.filter(row => ids.slice(index * size, (index + 1) * size).includes(row.editorialId)),
  }));
}
