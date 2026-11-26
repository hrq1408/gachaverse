'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { games } from '@/content/catalog';
import { adPreferenceKey, readAdPreference } from '@/features/advertising/privacy';
import { preferenceKey, readPreference, startAnalytics, stopAnalytics, trackAction, trackPage, type Preference } from '@/lib/analytics';

export function CookiePreferencesButton() {
  return <button type="button" className="cookie-link" onClick={() => window.dispatchEvent(new Event('cookie-preferences'))}>Preferências de cookies</button>;
}

export function Consent({ paths, advertisingAvailable = false }: { paths: string[]; advertisingAvailable?: boolean }) {
  const path = usePathname();
  const [preference, setPreference] = useState<Preference | null | undefined>(undefined);
  const [custom, setCustom] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [ads, setAds] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    function sync() { setPreference(readPreference()); }
    function storage(event: StorageEvent) {
      if (event.key === preferenceKey || event.key === null) sync();
    }
    function open() {
      opener.current = document.activeElement as HTMLElement;
      setEnabled(readPreference() === 'accepted');
      setAds(readAdPreference());
      setSaveError(false);
      setCustom(true);
    }
    sync();
    window.addEventListener('storage', storage);
    window.addEventListener('cookie-preferences', open);
    return () => {
      window.removeEventListener('storage', storage);
      window.removeEventListener('cookie-preferences', open);
    };
  }, []);

  useEffect(() => { if (custom) heading.current?.focus(); }, [custom]);

  useEffect(() => {
    if (preference !== 'accepted') {
      if (preference !== undefined) stopAnalytics();
      return;
    }
    startAnalytics();
    trackPage(path, paths);
    function click(event: MouseEvent) {
      const link = event.target instanceof Element ? event.target.closest('a[data-game]') : null;
      const game = link?.getAttribute('data-game');
      if (!game || !games.some((entry) => entry.slug === game)) return;
      trackAction(link?.hasAttribute('data-redemption') ? 'redemption_click' : 'game_click', { game_slug: game });
    }
    document.addEventListener('click', click, true);
    const article = document.querySelector('[data-article-end]');
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && paths.includes(path) && path.startsWith('/artigos/')) {
        trackAction('article_read', { article_slug: path.split('/')[2] });
        observer.disconnect();
      }
    });
    if (article) observer.observe(article);
    return () => { document.removeEventListener('click', click, true); observer.disconnect(); };
  }, [preference, path, paths]);

  function save(value: Preference) {
    if (value === 'declined') stopAnalytics();
    try { localStorage.setItem(preferenceKey, value); } catch { /* Keep the choice for this visit. */ }
    setPreference(value);
    if (advertisingAvailable && ads !== readAdPreference()) {
      try {
        localStorage.setItem(adPreferenceKey, ads ? 'accepted' : 'declined');
      } catch {
        setSaveError(true);
        return;
      }
      window.location.reload();
      return;
    }
    setCustom(false);
    opener.current?.focus();
    opener.current = null;
  }

  if (!custom && (advertisingAvailable || preference !== null)) return null;
  return <aside className="cookie-panel" aria-labelledby="cookie-heading">
    <h2 ref={heading} tabIndex={-1} id="cookie-heading">{custom ? 'Preferências de cookies' : 'Sua privacidade no GachaVerse'}</h2>
    <p>Com sua permissão, usamos o Google Analytics para saber quais jogos e guias recebem visitas. Sua escolha pode ser alterada no rodapé. <Link href="/privacidade/">Política de privacidade</Link></p>
    {custom && <label className="cookie-choice"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /> Permitir medição de audiência</label>}
    {custom && advertisingAvailable && <>
      <label className="cookie-choice"><input type="checkbox" checked={ads} onChange={(event) => setAds(event.target.checked)} /> Permitir publicidade do Google</label>
      <p>Se você autorizar, o AdSense pode usar cookies, dados do dispositivo e informações da visita para exibir e medir anúncios, inclusive personalizados. O Google pode pedir escolhas adicionais de acordo com a região. Use o link de privacidade do Google para revê-las quando estiver disponível.</p>
      {saveError && <p role="alert">O navegador não permitiu salvar a alteração de publicidade.</p>}
    </>}
    <div className="cookie-actions">
      {custom ? <button type="button" onClick={() => save(enabled ? 'accepted' : 'declined')}>Salvar preferências</button> : <>
        <button type="button" onClick={() => save('accepted')}>Aceitar</button>
        <button type="button" onClick={() => save('declined')}>Recusar</button>
        <button type="button" onClick={() => setCustom(true)}>Personalizar</button>
      </>}
    </div>
  </aside>;
}
