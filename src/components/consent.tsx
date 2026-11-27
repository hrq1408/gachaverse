'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { games } from '@/content/catalog';
import { adPreferenceKey, readAdPreference } from '@/features/advertising/privacy';
import { preferenceKey, readPreference, startAnalytics, stopAnalytics, trackAction, trackPage, type Preference } from '@/lib/analytics';
import type { Locale } from '@/i18n/locales';
import { messages } from '@/i18n/messages';
import { toolPath } from '@/i18n/tools';

export function CookiePreferencesButton({ locale = 'pt-BR' }: { locale?: Locale }) {
  return <button type="button" className="cookie-link" onClick={() => window.dispatchEvent(new Event('cookie-preferences'))}>{messages[locale].preferences}</button>;
}

export function Consent({ paths, advertisingAvailable = false, locale = 'pt-BR' }: { paths: string[]; advertisingAvailable?: boolean; locale?: Locale }) {
  const copy = messages[locale];
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
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link) return;
      const game = link.getAttribute('data-game');
      if (game && games.some((entry) => entry.slug === game)) {
        trackAction(link.hasAttribute('data-redemption') ? 'redemption_click' : 'game_click', { game_slug: game });
      }
      if (!URL.canParse(link.href)) return;
      const destination = new URL(link.href);
      if (destination.origin !== location.origin || !paths.includes(destination.pathname) || destination.pathname === path) return;
      if (destination.pathname.startsWith('/artigos/')) {
        trackAction('article_link_click', { article_slug: destination.pathname.split('/')[2] });
      } else if (['/ferramentas/calculadora-pity/', '/ferramentas/warp-tracker/'].includes(destination.pathname)) {
        trackAction('tool_link_click', { tool_slug: destination.pathname.split('/')[2] });
      } else if (destination.pathname.endsWith('/calendario/')) {
        trackAction('calendar_link_click', { calendar_path: destination.pathname });
      }
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
    if (custom && advertisingAvailable && ads !== readAdPreference()) {
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

  if (!custom && preference !== null) return null;
  return <aside className="cookie-panel" aria-labelledby="cookie-heading">
    <h2 ref={heading} tabIndex={-1} id="cookie-heading">{custom ? copy.preferences : copy.consentTitle}</h2>
    <p>{copy.consentBody} <Link href={toolPath('privacy', locale)}>{copy.policy}</Link></p>
    {custom && <label className="cookie-choice"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /> {copy.allowAnalytics}</label>}
    {custom && advertisingAvailable && <>
      <label className="cookie-choice"><input type="checkbox" checked={ads} onChange={(event) => setAds(event.target.checked)} /> {copy.allowAds}</label>
      <p>{copy.adNotice} <a href={'https://policies.google.com/technologies/partner-sites?hl=' + locale}>{copy.google}</a>.</p>
      {saveError && <p role="alert">{copy.saveError}</p>}
    </>}
    <div className="cookie-actions">
      {custom ? <button type="button" onClick={() => save(enabled ? 'accepted' : 'declined')}>{copy.save}</button> : <>
        <button type="button" onClick={() => save('accepted')}>{copy.accept}</button>
        <button type="button" onClick={() => save('declined')}>{copy.decline}</button>
        <button type="button" onClick={() => setCustom(true)}>{copy.customize}</button>
      </>}
    </div>
  </aside>;
}
