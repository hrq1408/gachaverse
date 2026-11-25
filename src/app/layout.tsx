import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Footer, Header } from '@/components/chrome';
import { site } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  ...(site.url ? { metadataBase: new URL(site.url) } : {}),
  title: { default: site.name, template: '%s | GachaVerse' },
  description: site.description,
  robots: { index: Boolean(site.url), follow: true },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR">
    <head>
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6914991641652412"
        crossOrigin="anonymous"
      />
    </head>
    <body>
      <a className="skip-link" href="#principal">Pular para o conteúdo</a>
      <Header />
      <main id="principal" tabIndex={-1}>{children}</main>
      <Footer />
    </body>
  </html>;
}

