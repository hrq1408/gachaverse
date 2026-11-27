import { EditorialArticle, EditorialGame, EditorialIndex } from '@/components/editorial-pages';
import { notFound } from 'next/navigation';
import { articleAlternates, publishedTranslations, reviewTranslations, translationPath, translations } from '@/i18n/articles';
import { guidesPath, guidesSegment, isTranslationLocale } from '@/i18n/locales';
import { editorialMessages, messages } from '@/i18n/messages';
import { articleSeoTitle, guideAlternates, localizedMetadata } from '@/i18n/seo';
import { games } from '@/content/catalog';
import { ToolContent } from '@/i18n/tool-content';
import { codeGameAlternates, gameHubAlternates, gameHubPath, toolAlternates, toolPages, toolPath, toolRoutes, toolTitles } from '@/i18n/tools';

type Props = { params: Promise<{ lang: string; segments: string[] }> };
const visible = reviewTranslations ? translations.filter(entry => entry.status !== 'withdrawn') : publishedTranslations;
export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { lang: string } }) {
  const { lang } = params;
  if (!isTranslationLocale(lang)) return [];
  const section = guidesSegment[lang];
  return [{ segments: [section] }, ...visible.filter(entry => entry.locale === lang)
    .map(entry => ({ segments: [section, entry.slug] })),
    ...toolPages.map(page => ({ segments: [toolRoutes[page][lang]] })),
    ...games.flatMap(game => [{ segments: [toolRoutes.codes[lang], game.slug] },
      { segments: gameHubPath(game.slug, lang).split('/').filter(Boolean).slice(1) }])];
}

async function resolveRoute(params: Props['params']) {
  const { lang, segments } = await params;
  if (!isTranslationLocale(lang) || segments.length > 2) notFound();
  if (segments[0] === (lang === 'en' ? 'games' : 'juegos')) {
    const hub = games.find(game => game.slug === segments[1]);
    if (!hub) notFound();
    return { lang, hub, entry: undefined };
  }
  const tool = toolPages.find(page => toolRoutes[page][lang] === segments[0]);
  if (tool) {
    const game = tool === 'codes' ? games.find(item => item.slug === segments[1]) : undefined;
    if (segments[1] && !game) notFound();
    return { lang, tool, game, entry: undefined };
  }
  if (segments[0] !== guidesSegment[lang]) notFound();
  const entry = segments[1] ? visible.find(row => row.locale === lang && row.slug === segments[1]) : undefined;
  if (segments[1] && !entry) notFound();
  return { lang, entry };
}

export async function generateMetadata({ params }: Props) {
  const { lang, entry, tool, game, hub } = await resolveRoute(params);
  if (hub) return localizedMetadata(lang, hub.name, hubDescription(lang, hub.name), gameHubPath(hub.slug, lang), true, gameHubAlternates(hub.slug));
  if (tool) {
    const [title, description] = toolTitles[lang][tool];
    return localizedMetadata(lang, game ? game.name + ' — ' + title : title, description,
      toolPath(tool, lang) + (game ? game.slug + '/' : ''), tool !== 'search',
      tool === 'search' ? {} : game ? codeGameAlternates(game.slug) : toolAlternates(tool));
  }
  if (entry) return localizedMetadata(lang, articleSeoTitle(entry.editorialId, entry.article.titulo, lang), entry.article.descricao, translationPath(entry), entry.indexable,
    entry.indexable ? articleAlternates(entry.editorialId) : {}, entry);
  const index = publishedTranslations.some(row => row.locale === lang);
  return localizedMetadata(lang, messages[lang].guides, editorialMessages[lang].guideDescription, guidesPath(lang), index,
    index ? guideAlternates() : {});
}

function hubDescription(lang: 'en' | 'es', name: string) {
  return lang === 'en' ? 'Browse ' + name + ' guides, redemption instructions and confirmed banner dates.'
    : 'Consulta guías de ' + name + ', instrucciones de canje y fechas confirmadas de sus banners.';
}

export default async function LocalizedGuide({ params }: Props) {
  const { lang, entry, tool, game, hub } = await resolveRoute(params);
  if (tool) return <ToolContent page={tool} locale={lang} game={game} />;
  if (hub) return <EditorialGame game={hub} locale={lang} />;
  const copy = editorialMessages[lang];
  if (entry) return <EditorialArticle article={entry.article} locale={lang} path={translationPath(entry)}
    preview={entry.indexable ? undefined : copy.preview} />;
  return <EditorialIndex locale={lang} title={messages[lang].guides} description={copy.guideDescription}
    entries={visible.filter(row => row.locale === lang).map(row => ({ article: row.article, href: translationPath(row), note: row.indexable ? undefined : copy.preview }))} />;
}
