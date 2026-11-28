import { CookiePreferencesButton } from './consent';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';
import { articleSwitchMap } from '@/i18n/articles';
import { feedPath, guidesPath, homePath, type Locale } from '@/i18n/locales';
import { messages } from '@/i18n/messages';
import { toolPath, toolTitles } from '@/i18n/tools';
import { gameDirectoryPath, toolsDirectoryPath } from '@/i18n/visual-content';
import { newsLabels } from '@/i18n/news';

function Brand({ locale = 'pt-BR' }: { locale?: Locale }) {
  return <Link className="brand" href={homePath(locale)}><Image src="/images/gachaverse-logo.webp" width={210} height={52} alt="GachaVerse" /></Link>;
}

export function Header({ locale = 'pt-BR' }: { locale?: Locale }) {
  const copy = messages[locale];
  return <header className="site-header">
    <div className="shell header-inner">
      <Brand locale={locale} />
      <nav aria-label={copy.navigation}>
        <Link href={homePath(locale)}>{copy.home}</Link>
        <Link href={gameDirectoryPath(locale)}>{copy.games}</Link>
        <Link href={guidesPath(locale)}>{copy.guides}</Link>
        <Link href={toolPath('news', locale)}>{newsLabels[locale][0]}</Link>
        <Link href={toolPath('codes', locale)}>{copy.codes}</Link>
        <Link href={toolPath('calendar', locale)}>{copy.banners}</Link>
        <Link href={toolsDirectoryPath(locale)}>{copy.tools}</Link>
      </nav>
      <div className="header-tools">
        <Link className="theme-toggle" href={toolPath('search', locale)} aria-label={copy.search}><Search size={19} aria-hidden="true" /></Link>
        <ThemeToggle locale={locale} />
        <LanguageSwitcher locale={locale} links={articleSwitchMap()} />
      </div>
    </div>
  </header>;
}

const footerCopy = {
  'pt-BR': { description: 'Portal independente de jogos gacha em português.', about: 'Sobre o GachaVerse', advertising: 'Publicidade e afiliados', advertise: 'Anuncie' },
  en: { description: 'Independent gacha game portal in English.', about: toolTitles.en.about[0], advertising: toolTitles.en.advertising[0], advertise: toolTitles.en.advertise[0] },
  es: { description: 'Portal independiente de juegos gacha en español.', about: toolTitles.es.about[0], advertising: toolTitles.es.advertising[0], advertise: toolTitles.es.advertise[0] },
} as const;

export function Footer({ locale = 'pt-BR' }: { locale?: Locale }) {
  const copy = messages[locale];
  const footer = footerCopy[locale];
  return <footer className="site-footer">
    <div className="shell footer-inner">
      <div><Brand locale={locale} /><p>{footer.description}</p></div>
      <nav aria-label={copy.footer}>
        <Link href={toolPath('about', locale)}>{footer.about}</Link>
        <Link href={toolPath('privacy', locale)}>{copy.privacy}</Link>
        <Link href={toolPath('advertising', locale)}>{footer.advertising}</Link>
        <Link href={toolPath('advertise', locale)}>{footer.advertise}</Link>
        <a href={feedPath(locale)}>{copy.rss}</a>
        <Link href={toolPath('contact', locale)}>{copy.contact}</Link>
        <CookiePreferencesButton locale={locale} />
      </nav>
    </div>
  </footer>;
}
