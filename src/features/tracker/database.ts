import { mergeHistory, type Warp } from './history';

async function database(): Promise<IDBDatabase> {
  return new Promise((resolve,reject) => {
    const req = indexedDB.open('gachaverse-warp-v1',1);
    req.onupgradeneeded = () => req.result.createObjectStore('history');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('Feche outras abas do tracker e tente novamente.'));
  });
}
export async function historyTransaction(incoming?: Warp[]): Promise<Warp[]> {
  const db = await database();
  return new Promise((resolve,reject) => {
    const tx = db.transaction('history',incoming ? 'readwrite' : 'readonly');
    const store = tx.objectStore('history');
    const request = store.get('records');
    let rows: Warp[] = [];
    let failure: unknown;
    request.onsuccess = () => {
      try {
        rows = request.result ?? [];
        if (incoming) {
          rows = mergeHistory(rows, incoming);
          if (rows.length > 20000 || new Blob([JSON.stringify({version:1,saltos:rows})]).size > 5 * 1024 * 1024)
            throw new Error('O diário completo excederia o limite de 20 mil registros ou 5 MB.');
          store.put(rows, 'records');
        }
      } catch (error) { failure = error; tx.abort(); }
    };
    tx.oncomplete = () => { db.close(); resolve(rows); };
    tx.onabort = () => { db.close(); reject(failure ?? tx.error); };
  });
}
export async function deleteLegacyHistory():Promise<void>{
  const db=await database();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('history','readwrite');
    tx.objectStore('history').delete('records');
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onabort=()=>{db.close();reject(tx.error);};
  });
}