'use client';

import { Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { guidesPath, homePath, localeLabels, translatedLocales, type Alternates, type Locale } from '@/i18n/locales';
import { messages } from '@/i18n/messages';
import { codeGameAlternates, gameHubAlternates, toolAlternates, toolPages, toolPath } from '@/i18n/tools';

const preferenceKey = 'gachaverse-language';
const preferenceEvent = 'gachaverse-language-change';
const locales = ['pt-BR', ...translatedLocales] as const;
const subscribe = (notify: () => void) => {
  window.addEventListener('storage', notify);
  window.addEventListener(preferenceEvent, notify);
  return () => {
    window.removeEventListener('storage', notify);
    window.removeEventListener(preferenceEvent, notify);
  };
};
function readPreference() {
  try { return localStorage.getItem(preferenceKey); } catch { return null; }
}

export function LanguageSwitcher({ locale, links }: { locale: Locale; links: Record<string, Alternates> }) {
  const pathname = usePathname();
  const path = pathname.endsWith('/') ? pathname : pathname + '/';
  const preferred = useSyncExternalStore(subscribe, readPreference, () => null);
  const copy = messages[locale];
  const tool = toolPages.find(page => toolPath(page, locale) === path);
  const codeGame = /^(?:\/jogos\/([^/]+)\/codigos\/|\/(?:en\/codes|es\/codigos)\/([^/]+)\/)$/.exec(path);
  const hub = /^\/(?:jogos|en\/games|es\/juegos)\/([^/]+)\/$/.exec(path)?.[1];
  const toolLinks = tool ? toolAlternates(tool) : codeGame ? codeGameAlternates(codeGame[1] || codeGame[2]) : hub ? gameHubAlternates(hub) : undefined;
  const inGuides = locales.some(lang => guidesPath(lang) === path) || /^(?:\/artigos\/|\/(?:en\/guides|es\/guias)\/)/.test(path);
  return <details className="language-switcher">
    <summary aria-label={copy.language}><Globe size={18} aria-hidden="true" /><span>{locale === 'pt-BR' ? 'PT' : locale.toUpperCase()}</span></summary>
    <ul>{locales.map(lang => <li key={lang}>
      <a href={links[path]?.[lang] ?? toolLinks?.[lang] ?? (lang === locale ? path : inGuides ? guidesPath(lang) : homePath(lang))}
        hrefLang={lang} lang={lang} aria-current={lang === locale ? 'true' : undefined}
        onClick={() => {
          try {
            localStorage.setItem(preferenceKey, lang);
            window.dispatchEvent(new Event(preferenceEvent));
          } catch { /* Navigation works when storage is unavailable. */ }
        }}>
        {localeLabels[lang]}{preferred === lang && <small className="language-preferred" lang={locale}>{copy.preferred}</small>}
      </a>
    </li>)}</ul>
  </details>;
}
