import { SectionContent } from '@/components/catalog';
import { InstitutionalPage, SectionPage } from '@/components/page-frames';
import { PityPage } from '@/components/pity-page';
import { SearchPage } from '@/components/search-page';
import { sections, type Game } from '@/content/catalog';
import Link from 'next/link';
import { InstitutionalContent, institutionHeadings } from './institutional';
import type { TranslationLocale } from './locales';
import { gameHubPath, toolTitles, type ToolPage } from './tools';

export function ToolContent({ page, locale, game }: { page: ToolPage; locale: TranslationLocale; game?: Game }) {
  const [title, description] = toolTitles[locale][page];
  if (page === 'pity') return <PityPage locale={locale} />;
  if (page === 'search') return <SearchPage locale={locale} />;
  if (page === 'codes' || page === 'calendar') {
    const section = sections.find(entry => entry.slug === (page === 'codes' ? 'codigos' : 'calendario'))!;
    return <SectionPage eyebrow={game?.name ?? 'GachaVerse'} title={title} description={description}
      before={game && <Link href={gameHubPath(game.slug, locale)} className="back-link">{game.name}</Link>}>
      <SectionContent section={section} locale={locale} game={game} />
    </SectionPage>;
  }
  const heading = institutionHeadings[locale][page];
  return <InstitutionalPage eyebrow={heading.eyebrow} title={heading.title ?? title} description={description} as={page === 'about' ? 'div' : 'article'}>
    <InstitutionalContent page={page} locale={locale} />
  </InstitutionalPage>;
}
