'use client';

import { useEffect } from 'react';
import { loadAutoAds, readAdPreference, adPreferenceKey } from './privacy';

export function AutoAds({ src }: { src: string }) {
  useEffect(() => {
    void loadAutoAds(src);
    function sync(event: StorageEvent) {
      if ((event.key === adPreferenceKey || event.key === null) && !readAdPreference() &&
          document.getElementById('gachaverse-adsense')) window.location.reload();
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [src]);
  return null;
}
