import { CookiePreferencesButton } from './consent';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';
import { articleSwitchMap } from '@/i18n/articles';
import { guidesPath, homePath, type Locale } from '@/i18n/locales';
import { messages } from '@/i18n/messages';
import { toolPath } from '@/i18n/tools';

function Brand({ locale = 'pt-BR' }: { locale?: Locale }) {
  return <Link className="brand" href={homePath(locale)}><Image src="/images/gachaverse-logo.webp" width={210} height={52} alt="GachaVerse" /></Link>;
}

export function Header() {
  return <header className="site-header">
    <div className="shell header-inner">
      <Brand />
      <nav aria-label="Navegação principal">
        <Link href="/">Início</Link>
        <Link href="/jogos/">Jogos</Link>
        <Link href="/conteudo/artigos/">Guias</Link>
        <Link href="/conteudo/codigos/">Códigos</Link>
        <Link href="/conteudo/calendario/">Banners</Link>
        <Link href="/ferramentas/">Ferramentas</Link>
      </nav>
      <div className="header-tools">
        <Link className="theme-toggle" href="/busca/" aria-label="Buscar artigos"><Search size={19} aria-hidden="true" /></Link>
        <ThemeToggle />
        <LanguageSwitcher locale="pt-BR" links={articleSwitchMap()} />
      </div>
    </div>
  </header>;
}

export function LocalizedHeader({ locale }: { locale: 'en' | 'es' }) {
  const copy = messages[locale];
  return <header className="site-header">
    <div className="shell header-inner">
      <Brand locale={locale} />
      <nav aria-label={copy.navigation}>
        <Link href={homePath(locale)}>{copy.home}</Link>
        <Link href={guidesPath(locale)}>{copy.guides}</Link>
        <Link href="/jogos/" hrefLang="pt-BR">{copy.games} (PT)</Link>
        <Link href={toolPath('codes', locale)}>{copy.codes}</Link>
        <Link href={toolPath('calendar', locale)}>{copy.banners}</Link>
        <Link href={toolPath('pity', locale)}>{copy.tools}</Link>
      </nav>
      <div className="header-tools">
        <Link className="theme-toggle" href={toolPath('search', locale)} aria-label={copy.search}><Search size={19} aria-hidden="true" /></Link>
        <ThemeToggle locale={locale} />
        <LanguageSwitcher locale={locale} links={articleSwitchMap()} />
      </div>
    </div>
  </header>;
}

export function Footer() {
  return <footer className="site-footer">
    <div className="shell footer-inner">
      <div><Brand /><p>Portal independente de jogos gacha em português.</p></div>
      <nav aria-label="Informações do portal">
        <Link href="/sobre/">Sobre o GachaVerse</Link>
        <Link href="/privacidade/">Privacidade</Link>
        <Link href="/publicidade-e-afiliados/">Publicidade e afiliados</Link>
        <Link href="/anuncie/">Anuncie</Link>
        <a href="/rss.xml">RSS de artigos</a>
        <Link href="/contato/">Contato</Link>
        <CookiePreferencesButton />
      </nav>
    </div>
  </footer>;
}

