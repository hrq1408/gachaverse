import { createHash } from 'node:crypto';
import { type Article } from '../../src/content/articles';
import { bannerAnnouncements, banners } from '../../src/content/banners';
import { gamePath, games, type Game } from '../../src/content/catalog';
import { reviewBanners } from '../banner-review';
import type { OfficialVideo } from '../redemption-sources';
import { normalize, overlap, type seoOpportunities } from './opportunities';
import type { importTrends } from './trends';

type Brief = {
  id: string;
  title: string;
  keyword: string;
  secondaryKeywords: string[];
  intent: string;
  game: Game['slug'];
  category: 'artigos';
  officialSources: string[];
  outline: string[];
  seoDescription: string;
  slug: string;
  internalLinks: string[];
  coverSuggestion: string;
  priority: 'alta' | 'média' | 'baixa';
  reviewStatus: 'pendente' | 'em revisão' | 'aprovada' | 'rejeitada';
  evidence: 'métricas observadas' | 'hipótese editorial';
  action: 'nova pauta' | 'revisar artigo existente';
  evidenceNote: string;
  score: { relevance: number; freshness: number; sourceQuality: number; seo: number };
};
const asSlug = (value: string) => normalize(value).replaceAll(' ', '-');
const idFor = (value: string) => createHash('sha256').update(value).digest('hex').slice(0, 20);

function links(game: Game, articles: Article[], keyword: string) {
  const base = gamePath(game);
  const guides = articles.filter(article => article.jogos.includes(game.slug))
    .map(article => ({ article, similarity: overlap(keyword, article.titulo + ' ' + article.descricao) }))
    .sort((a, b) => b.similarity - a.similarity || a.article.slug.localeCompare(b.article.slug))
    .slice(0, 3).map(({ article }) => '/artigos/' + article.slug + '/');
  return [base, base + 'codigos/', base + 'calendario/', ...guides,
    ...(game.slug === 'honkai-star-rail' ? ['/ferramentas/calculadora-pity/'] : [])];
}

export function editorialQueue(articles: Article[], videos: OfficialVideo[], now: Date,
  seo?: ReturnType<typeof seoOpportunities>, trends?: ReturnType<typeof importTrends>) {
  const briefs = new Map<string, Brief>();
  const add = (draft: Omit<Brief, 'priority' | 'category' | 'reviewStatus' | 'coverSuggestion'>) => {
    if (briefs.has(draft.id) || [...briefs.values()].some(item => item.slug === draft.slug)) return;
    const points = Object.values(draft.score).reduce((sum, part) => sum + part, 0);
    briefs.set(draft.id, { ...draft, category: 'artigos', reviewStatus: 'pendente',
      priority: points >= 8 ? 'alta' : points >= 6 ? 'média' : 'baixa',
      coverSuggestion: (draft.action === 'revisar artigo existente' ? 'Revise a capa atual em relação à dúvida desta pauta. ' :
        draft.evidence === 'hipótese editorial' ? 'Crie uma ilustração original com motivos de calendário e anúncio. ' :
          'Crie uma ilustração original que represente a tarefa descrita na consulta. ') +
        'Use somente material com licença compatível e revise o crédito e o texto alternativo.',
    });
  };
  for (const entry of seo?.keywords ?? []) {
    const target = articles.find(article => article.slug === (entry.measuredArticles[0] ?? entry.possibleCoverage[0]));
    const game = games.find(item => item.slug === (entry.game ?? (target?.jogos.length === 1 ? target.jogos[0] : null)));
    if (!game) continue;
    const slug = target?.slug ?? asSlug(entry.query).slice(0, 90).replace(/-$/, '');
    if (!slug || (!target && articles.some(article => article.slug === slug))) continue;
    add({
      id: idFor(target ? 'update/' + target.slug : game.slug + '/' + slug),
      title: target?.titulo ?? entry.query.charAt(0).toLocaleUpperCase('pt-BR') + entry.query.slice(1),
      keyword: entry.query, secondaryKeywords: (seo?.keywords ?? []).filter(item => item.query !== entry.query &&
        (target ? item.measuredArticles.includes(target.slug) : item.game === game.slug && overlap(entry.query, item.query) >= 0.75))
        .slice(0, 3).map(item => item.query),
      intent: 'Investigar a intenção da consulta nos resultados brasileiros e validar a hipótese informacional.',
      game: game.slug, officialSources: [game.official],
      outline: ['Dar uma resposta direta à consulta', 'Explicar condições e limites com fontes oficiais', 'Incluir exemplo verificável e links úteis'],
      seoDescription: target?.descricao ?? 'Entenda a dúvida sobre ' + game.name + ' com passos verificáveis e referências oficiais.',
      slug, internalLinks: links(game, articles, entry.query).filter(link => link !== '/artigos/' + slug + '/'),
      evidence: 'métricas observadas', action: target ? 'revisar artigo existente' : 'nova pauta',
      evidenceNote: 'Consulta com impressões observadas no Search Console brasileiro em 28 dias. O status de revisão indica que a pauta ainda precisa de validação.',
      score: { relevance: 3, freshness: 1, sourceQuality: 1, seo: entry.metrics.impressions >= 100 ? 3 : 2 },
    });
  }
  for (const event of reviewBanners(banners, videos, now.getTime(), bannerAnnouncements).candidates) {
    const game = games.find(item => item.slug === event.game)!;
    const eventName = event.event.startsWith('fase-') ? 'fase ' + event.event.slice(5) :
      ({ 'programa-especial': 'programa especial', 'previa-da-versao': 'prévia', 'anuncio-de-banner': 'anúncio de banners' } as Record<string, string>)[event.event];
    const keyword = game.name + ' ' + event.version + ' ' + eventName;
    const slug = asSlug(keyword);
    if (articles.some(article => article.slug === slug || (article.jogos.includes(game.slug) && article.versao === event.version &&
      (article.categoria === 'calendario' || overlap(eventName, article.titulo) === 1)))) continue;
    const latest = Math.max(...videos.filter(video => event.sources.includes('https://www.youtube.com/watch?v=' + video.id))
      .map(video => Date.parse(video.publishedAt)));
    const trendSignal = trends?.terms.some(term => overlap(keyword, term) >= 0.75) ?? false;
    add({
      id: idFor(event.game + '/' + event.version + '/' + event.event),
      title: game.name + ' ' + event.version + ': o que sabemos sobre ' + eventName,
      keyword, secondaryKeywords: [game.name + ' atualização ' + event.version, game.name + ' calendário de banners'],
      intent: 'Encontrar um resumo verificável do anúncio e saber onde acompanhar os próximos banners.',
      game: game.slug, officialSources: event.sources,
      outline: ['Resumir somente o que o canal oficial confirmou', 'Separar datas e horários por região quando informados', 'Explicar o que ainda depende de confirmação'],
      seoDescription: 'Confira os anúncios oficiais de ' + game.name + ' ' + event.version + ' e saiba onde acompanhar o calendário.',
      slug, internalLinks: links(game, articles, keyword),
      evidence: 'hipótese editorial', action: 'nova pauta',
      evidenceNote: 'O vídeo comprova o anúncio. A demanda de pesquisa ainda é uma hipótese.' +
        (trendSignal ? ' Há uma série possivelmente relacionada no CSV do Google Trends; confira o termo e o período.' : ''),
      score: { relevance: 3, freshness: now.getTime() - latest <= 7 * 86_400_000 ? 3 : 1, sourceQuality: 3, seo: trendSignal ? 1 : 0 },
    });
  }
  const score = (item: Brief) => Object.values(item.score).reduce((sum, part) => sum + part, 0);
  return [...briefs.values()].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id));
}
