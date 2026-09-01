const entries = new Map();
const listeners = new Map();

export const keyOf = (key) => (Array.isArray(key) ? key.filter((part) => part !== undefined && part !== null).join(':') : String(key));

const notify = (key) => {
    const set = listeners.get(key);
    if (set) set.forEach((listener) => listener());
};

const patch = (key, next) => {
    entries.set(key, {...(entries.get(key) || {}), ...next});
    notify(key);
};

export const getEntry = (key) => entries.get(key) || null;

export const subscribe = (key, listener) => {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(listener);

    return () => {
        const set = listeners.get(key);
        if (!set) return;
        set.delete(listener);
        if (!set.size) listeners.delete(key);
    };
};

export const registerFetcher = (key, fetcher) => {
    patch(key, {fetcher});
};

const run = (key) => {
    const entry = entries.get(key);
    if (!entry || !entry.fetcher) return Promise.resolve(null);
    if (entry.promise) return entry.promise;

    const promise = Promise.resolve()
        .then(() => entry.fetcher())
        .then((data) => {
            patch(key, {data, error: null, loading: false, stale: false, promise: null, updatedAt: Date.now()});
            return data;
        })
        .catch((error) => {
            patch(key, {error, loading: false, stale: true, promise: null});
            return null;
        });

    patch(key, {loading: true, promise});

    return promise;
};

export const ensureLoaded = (key) => {
    const entry = entries.get(key);
    if (entry && entry.data !== undefined && !entry.stale) return Promise.resolve(entry.data);
    return run(key);
};

export const revalidate = (key) => run(key);

export const setData = (key, updater) => {
    const entry = entries.get(key) || {};
    const next = typeof updater === 'function' ? updater(entry.data) : updater;
    patch(key, {data: next});
};

export const invalidate = (key) => {
    const prefix = keyOf(key);

    entries.forEach((entry, storedKey) => {
        if (storedKey !== prefix && !storedKey.startsWith(`${prefix}:`)) return;

        if (listeners.has(storedKey)) {
            patch(storedKey, {stale: true});
            run(storedKey);
        } else {
            entries.delete(storedKey);
        }
    });
};

export const invalidateAll = (keys) => (keys || []).forEach(invalidate);

export const dropCache = () => {
    entries.clear();
};
