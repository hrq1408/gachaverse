import assert from 'node:assert/strict';
import { test } from 'node:test';
import { publicPaths, articles } from '../src/content/editorial';
import { articleAlternates, publishedTranslations } from '../src/i18n/articles';
import { internationalSitemapPaths, localizedNewsAlternates } from '../src/i18n/seo';
import { approvalSchema } from '../scripts/editorial-engine/draft';

test('notícia publicada liga as três versões aos índices e à canônica original', () => {
  const slug = 'wuthering-waves-3-8-eventos-dezembro';
  assert(articles.some(article => article.slug === slug && article.noticia));
  const translations = publishedTranslations.filter(row => row.editorialId === slug);
  assert.equal(translations.length, 2);
  assert(translations.every(row => !row.stale && row.article.noticia));
  assert.equal(articleAlternates(slug)['x-default'], '/artigos/' + slug + '/');
  assert.deepEqual(localizedNewsAlternates(), { 'pt-BR': '/noticias/', en: '/en/news/', es: '/es/noticias/', 'x-default': '/noticias/' });
  assert(publicPaths().includes('/noticias/'));
  assert(internationalSitemapPaths().some(row => row.path === '/en/news/'));
  assert(internationalSitemapPaths().some(row => row.path === '/es/noticias/'));
});

test('autonomia editorial preserva aprovação legada e exige o registro de revisão do Codex', () => {
  const approval = { id: 'artigo', digest: '0'.repeat(64), reviewer: 'Equipe editorial',
    date: '2026-11-28', status: 'aprovada', sourcesChecked: true, coverChecked: true };
  assert(approvalSchema.safeParse(approval).success);
  assert(!approvalSchema.safeParse({ ...approval, mode: 'codex' }).success);
  assert(approvalSchema.safeParse({ ...approval, mode: 'codex',
    evidence: { verifiedFacts: ['Prazo confirmado na nota oficial'], coverRights: 'Imagem editorial própria', languageReview: 'Original e duas traduções conferidos' },
  }).success);
});
