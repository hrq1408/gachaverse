import type { Article } from '@/content/articles';
import type { Locale } from '@/i18n/locales';

export type Breadcrumb = { name: string; path: string };

export function articleGraph(article: Article, crumbs: Breadcrumb[], origin: string, locale: Locale = 'pt-BR', authorName = article.autor) {
  const absolute = (path: string) => new URL(path, origin).href;
  const canonical = absolute(crumbs.at(-1)!.path);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': canonical + '#article',
        mainEntityOfPage: canonical,
        headline: article.titulo,
        description: article.descricao,
        image: [absolute(article.imagem)],
        datePublished: article.publicacao,
        dateModified: article.atualizacao,
        inLanguage: locale,
        author: {
          '@type': article.autor === 'Equipe editorial do GachaVerse' ? 'Organization' : 'Person',
          name: authorName,
          ...(article.autor === 'Equipe editorial do GachaVerse' && { url: absolute('/sobre/') }),
        },
        publisher: { '@type': 'Organization', name: 'GachaVerse', url: absolute('/') },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map(({ name, path }, index) => ({
          '@type': 'ListItem', position: index + 1, name, item: absolute(path),
        })),
      },
    ],
  };
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function xml(value: string) {
  return value.replace(/[<>&"']/g, character => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  })[character]!);
}

export function articleFeed(articles: Article[], origin: string, description: string, options = {
  home: '/', feed: '/rss.xml', locale: 'pt-BR' as Locale, articlePath: (article: Article) => '/artigos/' + article.slug + '/',
}) {
  const siteLink = new URL(options.home, origin).href;
  const feedLink = new URL(options.feed, origin).href;
  const items = articles.map(article => {
    const url = xml(new URL(options.articlePath(article), origin).href);
    return '<item><title>' + xml(article.titulo) + '</title><link>' + url + '</link><guid>' + url +
      '</guid><description>' + xml(article.descricao) + '</description><pubDate>' +
      new Date(article.publicacao).toUTCString() + '</pubDate></item>';
  });
  return '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>' +
    '<title>GachaVerse</title><link>' + xml(siteLink) + '</link><description>' + xml(description) +
    '</description><language>' + xml(options.locale) + '</language><atom:link href="' + xml(feedLink) +
    '" rel="self" type="application/rss+xml"/>' + items.join('') + '</channel></rss>\n';
}
