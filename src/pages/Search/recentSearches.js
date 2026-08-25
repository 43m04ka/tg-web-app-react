const STORAGE_KEY = 'gw:recent-searches';
const LIMIT = 6;

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

export const loadRecentSearches = () => read();

export const rememberSearch = (query) => {
    const value = String(query || '').trim();
    if (value.length < 2) return read();

    const next = [value, ...read().filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, LIMIT);
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
