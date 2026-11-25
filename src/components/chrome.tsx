import { CookiePreferencesButton } from './consent';
import { publishedSections } from '@/content/editorial';
import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { sectionPath } from '@/content/catalog';

function Brand() {
  return <Link className="brand" href="/"><span><Gamepad2 aria-hidden="true" size={21} /></span>Gacha<b>Verse</b></Link>;
}

export function Header() {
  return <header className="site-header">
    <div className="shell header-inner">
      <Brand />
      <nav aria-label="Navegação principal">
        <Link href="/jogos/">Jogos</Link>
        <Link href="/ferramentas/">Ferramentas</Link>
        <Link href="/busca/">Buscar artigos</Link>
        {publishedSections().map((section) => <Link key={section.slug} href={sectionPath(section)}>{section.slug === 'codigos' ? 'Códigos' : section.title}</Link>)}
      </nav>
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
        <Link href="/contato/">Contato</Link>
        <CookiePreferencesButton />
      </nav>
    </div>
  </footer>;
}

