const DB_NAME = 'gw-cache';
const STORE_NAME = 'entries';
const VERSION = 1;

let dbPromise = null;

const openDb = () => {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(new Error('IndexedDB is unavailable'));
            return;
        }

        const request = indexedDB.open(DB_NAME, VERSION);
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains(STORE_NAME)) {
                request.result.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    }).catch((error) => {
        dbPromise = null;
        throw error;
    });

    return dbPromise;
};

const withStore = async (mode, action) => {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const request = action(transaction.objectStore(STORE_NAME));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const readBigCache = async (name, maxAgeMs = Infinity) => {
    try {
        const entry = await withStore('readonly', (store) => store.get(name));
        if (!entry) return null;
        if (Date.now() - entry.savedAt > maxAgeMs) return null;
        return entry.value;
    } catch (e) {
        return null;
    }
};

export const writeBigCache = async (name, value) => {
    try {
        await withStore('readwrite', (store) => store.put({savedAt: Date.now(), value}, name));
    } catch (e) {
    }
};
