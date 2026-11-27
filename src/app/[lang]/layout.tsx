import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Consent, CookiePreferencesButton } from '@/components/consent';
import { LocalizedHeader } from '@/components/chrome';
import { advertisingPolicy, adsenseClient, autoAdsEnabled, autoAdsSource } from '@/features/advertising/config';
import { publicPaths } from '@/content/editorial';
import { internationalSitemapPaths } from '@/i18n/seo';
import { feedPath, isTranslationLocale, translatedLocales } from '@/i18n/locales';
import { messages } from '@/i18n/messages';
import { site } from '@/lib/site';
import { toolPath, toolTitles } from '@/i18n/tools';
import '../globals.css';

export const dynamicParams = false;
export const generateStaticParams = () => translatedLocales.map(lang => ({ lang }));

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isTranslationLocale(lang)) notFound();
  return {
    ...(site.url && { metadataBase: new URL(site.url), alternates: { types: { 'application/rss+xml': feedPath(lang) } } }),
    title: { default: site.name, template: '%s | GachaVerse' },
    other: { 'google-adsense-account': adsenseClient },
    robots: { index: Boolean(site.url), follow: true },
  };
}

export default async function LocalizedLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isTranslationLocale(lang)) notFound();
  const copy = messages[lang];
  const adSource = autoAdsSource(advertisingPolicy, autoAdsEnabled, adsenseClient);
  return <html lang={lang} suppressHydrationWarning>
    <head>
      {/* eslint-disable-next-line @next/next/no-sync-scripts -- Read the local theme before the first paint. */}
      <script src="/theme-init.js" />
    </head>
    <body>
      <a className="skip-link" href="#principal">{copy.skip}</a>
      <LocalizedHeader locale={lang} />
      <main id="principal" tabIndex={-1}>{children}</main>
      <footer className="site-footer"><div className="shell footer-inner">
        <a className="brand" href={'/' + lang + '/'}>GachaVerse</a>
        <nav aria-label={copy.footer}>
          {(['about', 'privacy', 'advertising', 'advertise', 'contact'] as const).map(page =>
            <Link key={page} href={toolPath(page, lang)}>{toolTitles[lang][page][0]}</Link>)}
          <a href={feedPath(lang)}>{copy.rss}</a>
          <CookiePreferencesButton locale={lang} />
        </nav>
      </div></footer>
      <Consent locale={lang} advertisingAvailable={Boolean(adSource)} paths={[...publicPaths(), ...internationalSitemapPaths().map(row => row.path)]} />
    </body>
  </html>;
}
