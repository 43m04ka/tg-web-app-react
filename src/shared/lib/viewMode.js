const STORAGE_KEY = '__app_view_mode';
const MODES = ['desktop', 'mobile'];

export const DESKTOP_MIN_WIDTH = 1024;

const readStored = () => {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        return MODES.includes(stored) ? stored : null;
    } catch (e) {
        return null;
    }
};

const writeStored = (mode) => {
    try {
        if (mode) sessionStorage.setItem(STORAGE_KEY, mode);
        else sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
    }
};

const readQuery = () => {
    try {
        return new URLSearchParams(window.location.search).get('view');
    } catch (e) {
        return null;
    }
};

export const resolveForcedViewMode = () => {
    const query = readQuery();

    if (query === 'auto') {
        writeStored(null);
        return null;
    }

    if (MODES.includes(query)) {
        writeStored(query);
        return query;
    }

    return readStored();
};

let forcedMode = typeof window === 'undefined' ? null : resolveForcedViewMode();

export const forcedViewMode = () => forcedMode;
