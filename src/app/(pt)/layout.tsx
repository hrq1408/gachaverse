import { advertisingPolicy, adsenseClient, autoAdsEnabled, autoAdsSource } from '@/features/advertising/config';
import { AutoAds } from '@/features/advertising/auto-ads';
import { Consent } from '@/components/consent';
import { publicPaths } from '@/content/editorial';
import { games, sections, sectionPath } from '@/content/catalog';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Footer, Header } from '@/components/chrome';
import { site } from '@/lib/site';
import '../globals.css';

export const metadata: Metadata = {
  ...(site.url ? { metadataBase: new URL(site.url), alternates: { types: { 'application/rss+xml': '/rss.xml' } } } : {}),
  title: { default: site.name, template: '%s | GachaVerse' },
  description: site.description,
  other: { 'google-adsense-account': adsenseClient },
  robots: { index: Boolean(site.url), follow: true },
};

export default function Layout({ children }: { children: ReactNode }) {
  const adSource = autoAdsSource(advertisingPolicy, autoAdsEnabled, adsenseClient);
  return <html lang="pt-BR" suppressHydrationWarning>
    <head>
      {/* eslint-disable-next-line @next/next/no-sync-scripts -- Read the local theme before the first paint. */}
      <script src="/theme-init.js" />
    </head>
    <body>
      <a className="skip-link" href="#principal">Pular para o conteúdo</a>
      <Header />
      <main id="principal" tabIndex={-1}>{children}</main>
      <Footer />
      <Consent advertisingAvailable={Boolean(adSource)} paths={[...new Set(['/ferramentas/warp-tracker/painel/', ...publicPaths(), ...sections.flatMap((section) => [sectionPath(section), ...games.map((game) => sectionPath(section, game))])])]} />
      {adSource && <AutoAds src={adSource} pages={publicPaths().filter(path => path === '/' || path.startsWith('/artigos/'))} />}
    </body>
  </html>;
}

