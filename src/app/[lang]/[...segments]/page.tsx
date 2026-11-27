import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articleGraph, jsonLd } from '@/lib/article-distribution';
import { site } from '@/lib/site';
import { articleAlternates, publishedTranslations, reviewTranslations, translationPath, translations } from '@/i18n/articles';
import { guidesPath, guidesSegment, homePath, isTranslationLocale } from '@/i18n/locales';
import { editorialMessages, messages } from '@/i18n/messages';
import { guideAlternates, localizedMetadata } from '@/i18n/seo';

type Props = { params: Promise<{ lang: string; segments: string[] }> };
const visible = reviewTranslations ? translations : publishedTranslations;
export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { lang: string } }) {
  const { lang } = params;
  if (!isTranslationLocale(lang)) return [];
  const section = guidesSegment[lang];
  return [{ segments: [section] }, ...visible.filter(entry => entry.locale === lang)
    .map(entry => ({ segments: [section, entry.slug] }))];
}

async function resolveRoute(params: Props['params']) {
  const { lang, segments } = await params;
  if (!isTranslationLocale(lang) || segments[0] !== guidesSegment[lang] || segments.length > 2) notFound();
  const entry = segments[1] ? visible.find(row => row.locale === lang && row.slug === segments[1]) : undefined;
  if (segments[1] && !entry) notFound();
  return { lang, entry };
}

export async function generateMetadata({ params }: Props) {
  const { lang, entry } = await resolveRoute(params);
  if (entry) return localizedMetadata(lang, entry.article.titulo, entry.article.descricao, translationPath(entry), entry.indexable,
    entry.indexable ? articleAlternates(entry.editorialId) : {}, entry);
  const index = publishedTranslations.some(row => row.locale === lang);
  return localizedMetadata(lang, messages[lang].guides, editorialMessages[lang].guideDescription, guidesPath(lang), index,
    index ? guideAlternates() : {});
}

export default async function LocalizedGuide({ params }: Props) {
  const { lang, entry } = await resolveRoute(params);
  const copy = editorialMessages[lang];
  const menu = messages[lang];
  if (!entry) {
    const entries = visible.filter(row => row.locale === lang);
    return <div className="shell interior">
      <h1>{menu.guides}</h1><p>{copy.guideDescription}</p>
      {entries.length ? <ul className="localized-grid">{entries.map(row => <li key={row.slug} className="panel">
        <h2><Link href={translationPath(row)}>{row.article.titulo}</Link></h2><p>{row.article.descricao}</p>
        {!row.indexable && <small>{copy.preview}</small>}
      </li>)}</ul> : <p>{copy.empty}</p>}
      <a href={guidesPath('pt-BR')} hrefLang="pt-BR">{copy.fallback}</a>
    </div>;
  }
  const article = entry.article;
  const author = article.autor === 'Equipe editorial do GachaVerse' ? copy.author : article.autor;
  const date = new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' });
  const path = translationPath(entry);
  const crumbs = [{ name: menu.home, path: homePath(lang) }, { name: menu.guides, path: guidesPath(lang) },
    { name: article.titulo, path }];
  const related = publishedTranslations.filter(row => row.locale === lang && article.relacionados.includes(row.editorialId));
  return <div className="shell interior">
    {site.url && entry.indexable && <script type="application/ld+json" dangerouslySetInnerHTML={{
      __html: jsonLd(articleGraph(article, crumbs, site.url, lang, author)),
    }} />}
    <nav className="article-breadcrumbs" aria-label={copy.breadcrumb}>
      <Link href={homePath(lang)}>{menu.home}</Link><span aria-hidden="true">/</span>
      <Link href={guidesPath(lang)}>{menu.guides}</Link><span aria-hidden="true">/</span>
      <span aria-current="page">{article.titulo}</span>
    </nav>
    <article className="prose localized-article">
      {!entry.indexable && <p className="panel">{copy.preview}</p>}
      <h1>{article.titulo}</h1><p>{article.descricao}</p>
      <p>{author} · <time dateTime={article.publicacao}>{date.format(new Date(article.publicacao))}</time>
        {article.atualizacao !== article.publicacao && <> · {copy.updated} <time dateTime={article.atualizacao}>{date.format(new Date(article.atualizacao))}</time></>}
      </p>
      <Image src={article.imagem} alt={article.textoAlternativo} width={1200} height={675} preload />
      <nav className="panel" aria-label={copy.contents}>
        <h2>{copy.contents}</h2><ol>{article.headings.map(heading => <li key={heading.id}><a href={'#' + heading.id}>{heading.title}</a></li>)}</ol>
      </nav>
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: article.html }} />
      <section aria-label={copy.sources}><h2>{copy.sources}</h2><ul>
        {article.fontes.map(source => <li key={source.url}><a href={source.url} lang="pt-BR">{source.titulo}</a></li>)}
      </ul></section>
      <a href={'/artigos/' + entry.editorialId + '/'} hrefLang="pt-BR">{copy.fallback}</a>
      {related.length > 0 && <section><h2>{copy.related}</h2><ul>{related.map(row =>
        <li key={row.slug}><Link href={translationPath(row)}>{row.article.titulo}</Link></li>)}</ul></section>}
    </article>
  </div>;
}
