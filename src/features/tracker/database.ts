import type { Warp } from './history';
import { legacyDatabaseName } from './legacy';

async function database(): Promise<IDBDatabase> {
  return new Promise((resolve,reject) => {
    const req = indexedDB.open(legacyDatabaseName);
    req.onupgradeneeded = () => req.transaction?.abort();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('Feche outras abas do tracker e tente novamente.'));
  });
}
export async function historyTransaction(): Promise<Warp[]> {
  if (typeof indexedDB.databases === 'function' &&
      !(await indexedDB.databases()).some(db => db.name === legacyDatabaseName)) return [];
  const db = await database();
  return new Promise((resolve,reject) => {
    const tx = db.transaction('history','readonly');
    const store = tx.objectStore('history');
    const request = store.get('records');
    let rows: Warp[] = [];
    request.onsuccess = () => {
      rows = request.result ?? [];
    };
    tx.oncomplete = () => { db.close(); resolve(rows); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}
export function deleteLegacyHistory():Promise<void>{
  return new Promise((resolve,reject)=>{
    const request = indexedDB.deleteDatabase(legacyDatabaseName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Banco em uso.'));
  });
}
