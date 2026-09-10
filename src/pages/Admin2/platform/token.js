const STORAGE_KEY = 'admin2.session';

const listeners = new Set();

let unauthorizedHandler = null;

const read = () => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && parsed.token ? parsed : null;
    } catch {
        return null;
    }
};

let session = read();

const emit = () => {
    listeners.forEach((listener) => listener(session));
};

export const getSession = () => session;

export const getToken = () => (session ? session.token : null);

export const subscribeSession = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const saveSession = (next) => {
    session = next;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        void 0;
    }
    emit();
};

export const clearSession = () => {
    session = null;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        void 0;
    }
    emit();
};

export const setUnauthorizedHandler = (handler) => {
    unauthorizedHandler = handler;
};

export const reportUnauthorized = () => {
    if (unauthorizedHandler) unauthorizedHandler();
};
