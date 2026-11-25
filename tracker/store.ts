import { fileLimit, merge, type Profile } from './formats';
export type Mutation = (profiles: Profile[]) => Profile[];
export function transact(change?: Mutation): Promise<Profile[]> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('gachaverse-tracker', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('profiles');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('profiles', change ? 'readwrite' : 'readonly');
      const store = tx.objectStore('profiles'),
        req = store.get('all');
      let profiles: Profile[] = [],
        failure: unknown;
      req.onsuccess = () => {
        try {
          profiles = req.result ?? [];
          if (change) {
            profiles = change(profiles);
            for (const profile of profiles) {
              const size = new Blob([JSON.stringify({ version: 2, profiles: [profile] })]).size;
              if (size > fileLimit)
                throw Error('A conta excederia o limite de 32 MB para reimportação do backup.');
            }
            store.put(profiles, 'all');
          }
        } catch (e) {
          failure = e;
          tx.abort();
        }
      };
      tx.oncomplete = () => {
        db.close();
        resolve(profiles);
      };
      tx.onabort = () => {
        db.close();
        reject(failure ?? tx.error);
      };
    };
  });
}
export const importProfiles = (incoming: Profile[]) => transact((old) => merge(old, incoming));
