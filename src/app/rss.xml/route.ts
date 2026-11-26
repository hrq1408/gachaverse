import { articles } from '@/content/articles';
import { articleFeed } from '@/lib/article-distribution';
import { site } from '@/lib/site';

export const dynamic = 'force-static';

export function GET() {
  if (!site.url) return new Response('Feed indisponível sem SITE_URL.', { status: 404 });
  return new Response(articleFeed(articles, site.url, site.description), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
