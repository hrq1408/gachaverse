import { legacyDatabaseName } from '../tracker/legacy';

export const adPreferenceKey = 'gachaverse:advertising:v1';

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

export async function loadAutoAds(src: string) {
  if (!readAdPreference() || !await legacyStorageClear(window.indexedDB) || !readAdPreference()) return;
  if (document.getElementById('gachaverse-adsense')) return;
  const script = document.createElement('script');
  script.id = 'gachaverse-adsense';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = src;
  document.head.append(script);
}
