import sitemap from '../sitemap';

export const dynamic = 'force-static';

export function GET() {
  const urls = sitemap().map(entry => entry.url);
  return new Response(urls.length ? urls.join('\n') + '\n' : '', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
