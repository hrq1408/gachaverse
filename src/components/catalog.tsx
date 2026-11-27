import { ArticleCard } from './article';
import { RedemptionCenter } from './redemption-center';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, CalendarDays, Gamepad2, Gift, Layers3, Swords, UserRound, Users } from 'lucide-react';
import { gamePath, type Game, type Section } from '@/content/catalog';
import { findArticles } from '@/content/editorial';
import { redemptionCodes, redemptionSnapshot } from '@/content/redemption';
import { bannerAnnouncements, gameBanners } from '@/content/banners';
import { BannerCalendar } from './banner-calendar';
import type { Locale } from '@/i18n/locales';
import { gameHubPath } from '@/i18n/tools';
import { localizedSection, localizedSectionPath } from '@/i18n/visual-content';
import { announcementCopy, announcementLabels } from '@/i18n/calendar-copy';


const sectionIcons = { artigos: BookOpen, builds: Swords, 'tier-lists': Layers3, codigos: Gift, calendario: CalendarDays, personagens: UserRound, equipes: Users };

export function GameCard({ game, locale = 'pt-BR' }: { game: Game; locale?: Locale }) {
  return <Link data-game={game.slug} href={gameHubPath(game.slug, locale)} className="game-card">
    <Image className="game-cover" src={`/images/jogos/${game.slug}.webp`} width={640} height={360} alt="" />
    <div className="game-info"><span>{game.studio}</span><h3>{game.name}</h3></div>
  </Link>;
}

export function SectionCard({ section, game, locale = 'pt-BR' }: { section: Section; game?: Game; locale?: Locale }) {
  const Icon = sectionIcons[section.slug];
  const copy = localizedSection(section.slug, locale);
  return <Link href={localizedSectionPath(section, locale, game)} className="section-card">
    <span className="section-icon"><Icon size={20} aria-hidden="true" /></span>
    <h3>{copy.title}</h3><p>{copy.description}</p>
  </Link>;
}

export function SectionContent({ section, game, locale = 'pt-BR' }: {
  section: Section; game?: Game; locale?: Locale;
}) {
  if (section.slug === 'codigos') {
    const codes = game ? redemptionCodes.filter(entry => entry.game === game.slug) : redemptionCodes;
    return <RedemptionCenter key={game?.slug ?? 'central'} entries={codes} game={game} snapshot={redemptionSnapshot} locale={locale} />;
  }
  const entries = locale === 'pt-BR' ? findArticles(section, game) : [];
  const schedule = section.slug === 'calendario' ? gameBanners(game) : [];
  const announcements = section.slug === 'calendario'
    ? bannerAnnouncements.filter(item => !game || item.game === game.slug) : [];
  if (schedule.length) return <>
    {announcements.map(item => {
      const copy = locale !== 'pt-BR' && item.game === 'zenless-zone-zero' && item.version === '3.4' ? announcementCopy[locale] : undefined;
      const labels = announcementLabels[locale];
      const date = locale === 'pt-BR' ? item.release.split('-').reverse().join('/') :
        new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeZone: 'UTC' }).format(new Date(item.release));
      return <section key={item.game + item.version} className="panel banner-record mb-6" aria-labelledby={'versao-' + item.game + '-' + item.version}>
        <h2 id={'versao-' + item.game + '-' + item.version} lang={copy ? locale : 'pt-BR'}>{copy?.title ?? item.title}</h2>
        <p>{labels.release} <time dateTime={item.release}>{date}</time>.</p>
        <ul className="mt-3 ml-5 list-disc" lang={copy ? locale : 'pt-BR'}>{(copy?.highlights ?? item.highlights).map(detail => <li key={detail}>{detail}</li>)}</ul>
        <p lang={copy ? locale : 'pt-BR'}>{copy?.note ?? item.scheduleNote}</p>
        <p><a href={copy?.source ?? item.source}>{labels.source}</a></p>
      </section>;
    })}
    <BannerCalendar entries={schedule} snapshot={redemptionSnapshot} locale={locale} />
    {entries.length > 0 && <div className="editorial-grid mt-6">{entries.map(article => <ArticleCard article={article} key={article.slug} />)}</div>}
  </>;
  return <div className="content-stack">
    {entries.length ? entries.map((article) => <ArticleCard article={article} level={2} key={article.slug} />) : <div className="panel"><h2>Em preparação</h2><p>O primeiro conteúdo desta seção será publicado após revisão editorial.</p>
        <Link href={game ? gamePath(game) : '/jogos/'}>{game ? 'Voltar ao jogo' : 'Explorar jogos'}</Link>
      </div>}

  </div>;
}

export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="page-heading">
    <p className="eyebrow"><Gamepad2 size={16} aria-hidden="true" />{eyebrow}</p>
    <h1>{title}</h1><p className="intro">{description}</p>
  </div>;
}

