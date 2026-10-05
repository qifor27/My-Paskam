// Penyimpanan draft di perangkat (IndexedDB) agar isian & foto tidak hilang saat
// koneksi putus, sesi habis, atau aplikasi tertutup (PRD §19, §23). Tanpa
// dependency; sync queue penuh menyusul di Sprint 7.
const DB_NAME = "paskam";
// Naikkan versi setiap menambah store; onupgradeneeded membuat store yang belum ada.
const DB_VERSION = 2;
export const STORES = { laporan: "laporan-drafts", sparePart: "spare-part-drafts" } as const;
type StoreName = (typeof STORES)[keyof typeof STORES];

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      for (const name of Object.values(STORES)) {
        if (!req.result.objectStoreNames.contains(name)) req.result.createObjectStore(name, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(store, mode);
      const req = fn(tx.objectStore(store));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export const draftStore = {
  get: <T>(store: StoreName, id: string) => run<T | undefined>(store, "readonly", (s) => s.get(id)),
  list: <T>(store: StoreName) => run<T[]>(store, "readonly", (s) => s.getAll()),
  put: <T extends { id: string }>(store: StoreName, value: T) => run(store, "readwrite", (s) => s.put(value)),
  delete: (store: StoreName, id: string) => run(store, "readwrite", (s) => s.delete(id)),
};

/** Minta browser tidak menghapus data offline saat ruang penyimpanan menipis (Safari/iOS). */
export function requestPersistentStorage() {
  navigator.storage?.persist?.().catch(() => {});
}
