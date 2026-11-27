'use client';

import { Moon, Sun } from 'lucide-react';
import type { Locale } from '@/i18n/locales';
import { messages } from '@/i18n/messages';

export function ThemeToggle({ locale = 'pt-BR' }: { locale?: Locale }) {
  function toggle() {
    const root = document.documentElement;
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    try {
      localStorage.setItem('gachaverse-theme', theme);
    } catch {}
  }

  return <button className="theme-toggle" type="button" onClick={toggle}>
    <Moon className="theme-moon" size={19} aria-hidden="true" />
    <Sun className="theme-sun" size={19} aria-hidden="true" />
    <span className="sr-only theme-moon">{messages[locale].dark}</span>
    <span className="sr-only theme-sun">{messages[locale].light}</span>
  </button>;
}
