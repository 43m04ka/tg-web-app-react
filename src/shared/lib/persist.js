const NAMESPACE = 'gw';
const VERSION = 1;

const key = (name) => `${NAMESPACE}:${VERSION}:${name}`;

const safeStorage = (kind = 'session') => {
    try {
        const storage = kind === 'local' ? window.localStorage : window.sessionStorage;
        storage.getItem(key('probe'));
        return storage;
    } catch (e) {
        return null;
    }
};

export const readCache = (name, maxAgeMs = Infinity, kind = 'session') => {
    const storage = safeStorage(kind);
    if (!storage) return null;

    try {
        const raw = storage.getItem(key(name));
        if (!raw) return null;

        const {savedAt, value} = JSON.parse(raw);
        if (Date.now() - savedAt > maxAgeMs) {
            storage.removeItem(key(name));
            return null;
        }

        return value;
    } catch (e) {
        return null;
    }
};

export const writeCache = (name, value, kind = 'session') => {
    const storage = safeStorage(kind);
    if (!storage) return;

    try {
        storage.setItem(key(name), JSON.stringify({savedAt: Date.now(), value}));
    } catch (e) {
    }
};

export const clearCache = (name, kind = 'session') => {
    safeStorage(kind)?.removeItem(key(name));
};
