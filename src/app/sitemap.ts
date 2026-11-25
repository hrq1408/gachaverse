import type { MetadataRoute } from 'next';
import { publicPaths } from '@/content/editorial';
import { site } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = site.url;
  return origin ? publicPaths().map((path) => ({ url: new URL(path, origin).href })) : [];
}
