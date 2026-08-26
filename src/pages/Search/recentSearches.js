const STORAGE_KEY = 'gw:recent-searches';
const LIMIT = 6;
const MIN_LENGTH = 2;

const read = () => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
    } catch (error) {
        return [];
    }
};

const write = (items) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        return undefined;
    }

    return undefined;
};

const isDraftOf = (stored, value) => value.startsWith(stored) && stored.length < value.length;

export const loadRecentSearches = () => read();

export const rememberSearch = (query) => {
    const value = String(query || '').trim();
    if (value.length < MIN_LENGTH) return read();

    const lower = value.toLowerCase();

    const kept = read().filter((item) => {
        const stored = item.toLowerCase();
        return stored !== lower && !isDraftOf(stored, lower);
    });

    const next = [value, ...kept].slice(0, LIMIT);
    write(next);

    return next;
};

export const forgetSearch = (query) => {
    const next = read().filter((item) => item !== query);
    write(next);

    return next;
};

export const clearRecentSearches = () => {
    write([]);
    return [];
};
