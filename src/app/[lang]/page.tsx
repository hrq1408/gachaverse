import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { games, gamePath } from '@/content/catalog';
import { publishedTranslations, translationPath } from '@/i18n/articles';
import { editorialMessages, messages } from '@/i18n/messages';
import { homeAlternates, localizedMetadata } from '@/i18n/seo';
import { guidesPath, homePath, isTranslationLocale } from '@/i18n/locales';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  if (!isTranslationLocale(lang)) notFound();
  const copy = editorialMessages[lang];
  return localizedMetadata(lang, copy.title, copy.description, homePath(lang), true, homeAlternates);
}

export default async function LocalizedHome({ params }: Props) {
  const { lang } = await params;
  if (!isTranslationLocale(lang)) notFound();
  const copy = editorialMessages[lang];
  const nav = messages[lang];
  const entries = publishedTranslations.filter(entry => entry.locale === lang);
  const resources = [
    { path: '/conteudo/codigos/', title: nav.codes, description: copy.codeInfo },
    { path: '/conteudo/calendario/', title: nav.banners, description: copy.bannerInfo },
    { path: '/ferramentas/', title: nav.tools, description: copy.toolInfo },
  ];
  return <div className="shell interior localized-home">
    <section className="localized-hero">
      <div><h1>{copy.title}</h1><p>{copy.description}</p>
        <Link className="button" href={guidesPath(lang)}>{copy.browse}</Link>
      </div>
      <Image src="/portal.webp" width={720} height={405} alt={copy.coverAlt} preload />
    </section>
    <section aria-labelledby="localized-resources">
      <h2 id="localized-resources">{copy.resources}</h2>
      <ul className="localized-grid">{resources.map(({ path, title, description }) => <li className="panel" key={path}>
        <a href={path} hrefLang="pt-BR">{title} (PT)</a><p>{description}</p>
      </li>)}</ul>
    </section>
    <section aria-labelledby="localized-games">
      <h2 id="localized-games">{nav.games}</h2>
      <ul className="localized-grid">{games.map(game => <li className="panel" key={game.slug}>
        <a href={gamePath(game)} hrefLang="pt-BR">{game.name} (PT)</a>
      </li>)}</ul>
    </section>
    <section aria-labelledby="localized-guides">
      <h2 id="localized-guides">{nav.guides}</h2>
      {entries.length ? <ul className="localized-grid">{entries.map(entry => <li className="panel" key={entry.slug}>
        <Link href={translationPath(entry)}>{entry.article.titulo}</Link><p>{entry.article.descricao}</p>
      </li>)}</ul> : <p>{copy.empty} <a href={guidesPath('pt-BR')} hrefLang="pt-BR">{copy.fallback}</a></p>}
    </section>
  </div>;
}
