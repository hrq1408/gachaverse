import { CookiePreferencesButton } from './consent';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

function Brand() {
  return <Link className="brand" href="/"><Image src="/images/gachaverse-logo.webp" width={210} height={52} alt="GachaVerse" /></Link>;
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
        <Link href="/contato/">Contato</Link>
        <CookiePreferencesButton />
      </nav>
    </div>
  </footer>;
}

