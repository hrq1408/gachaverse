'use client';

import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
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
    <span className="sr-only theme-moon">Ativar tema escuro</span>
    <span className="sr-only theme-sun">Ativar tema claro</span>
  </button>;
}
