'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import { loadAutoAds, readAdPreference, adPreferenceKey, adsTagId } from './privacy';

export function AutoAds({ src, pages }: { src: string; pages: string[] }) {
  const path = usePathname();
  useLayoutEffect(() => {
    if (!pages.includes(window.location.pathname) && document.getElementById(adsTagId)) location.reload();
  }, [path, pages]);

  useEffect(() => {
    let current = true;
    void loadAutoAds(src, () => current && pages.includes(window.location.pathname));
    return () => { current = false; };
  }, [src, path, pages]);

  useEffect(() => {
    function sync(event: StorageEvent) {
      if ((event.key === adPreferenceKey || event.key === null) && !readAdPreference() &&
          document.getElementById(adsTagId)) window.location.reload();
    }
    function protectNavigation(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
          event.altKey || event.shiftKey || !document.getElementById(adsTagId)) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link || (link.target && link.target !== '_self') || !URL.canParse(link.href)) return;
      const url = new URL(link.href);
      if (url.origin === location.origin && !pages.includes(url.pathname)) event.stopPropagation();
    }
    window.addEventListener('storage', sync);
    document.addEventListener('click', protectNavigation, true);
    return () => {
      window.removeEventListener('storage', sync);
      document.removeEventListener('click', protectNavigation, true);
    };
  }, [pages]);
  return null;
}
