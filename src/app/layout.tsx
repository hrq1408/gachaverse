import { Consent } from '@/components/consent';
import { publicPaths } from '@/content/editorial';
import { games, sections, sectionPath } from '@/content/catalog';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Footer, Header } from '@/components/chrome';
import { site } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  ...(site.url ? { metadataBase: new URL(site.url) } : {}),
  title: { default: site.name, template: '%s | GachaVerse' },
  description: site.description,
  other: { 'google-adsense-account': 'ca-pub-6914991641652412' },
  robots: { index: Boolean(site.url), follow: true },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR">
    <body>
      <a className="skip-link" href="#principal">Pular para o conteúdo</a>
      <Header />
      <main id="principal" tabIndex={-1}>{children}</main>
      <Footer />
      <Consent paths={[...new Set([...publicPaths(), ...sections.flatMap((section) => [sectionPath(section), ...games.map((game) => sectionPath(section, game))])])]} />
    </body>
  </html>;
}

