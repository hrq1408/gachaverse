import { legacyDatabaseName } from '../tracker/legacy';

export const adPreferenceKey = 'gachaverse:advertising:v2';
export const adsTagId = 'gachaverse-adsense';

export function readAdPreference() {
  try { return localStorage.getItem(adPreferenceKey) === 'accepted'; }
  catch { return false; }
}

export async function legacyStorageClear(storage: Pick<IDBFactory, 'databases'> | undefined) {
  try {
    return Boolean(storage && (await storage.databases()).every(db => db.name !== legacyDatabaseName));
  } catch {
    return false;
  }
}

async function insertAdsenseTag(src: string, allowed: () => boolean) {
  if (!allowed() || !await legacyStorageClear(window.indexedDB) || !allowed()) return false;
  if (document.getElementById(adsTagId)) return true;
  const script = document.createElement('script');
  script.id = adsTagId;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = src;
  document.head.append(script);
  return true;
}

export async function loadAutoAds(src: string, pageAllowed: () => boolean) {
  const allowed = () => pageAllowed() && readAdPreference();
  if (!allowed()) return false;
  try {
    const response = await fetch('/_publicidade/elegibilidade', {
      cache: 'no-store', credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(5000),
    });
    const decision = response.ok ? await response.json() : null;
    return decision?.eligible === true && await insertAdsenseTag(src, allowed);
  } catch {
    return false;
  }
}
