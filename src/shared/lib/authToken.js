const KEY = 'gw-auth-token';

let memory = null;

export const getAuthToken = () => {
    if (memory) return memory;
    try {
        memory = window.localStorage.getItem(KEY);
    } catch (e) {
        memory = null;
    }
    return memory;
};

export const setAuthToken = (token) => {
    memory = token || null;
    try {
        if (token) window.localStorage.setItem(KEY, token);
        else window.localStorage.removeItem(KEY);
    } catch (e) {
        return undefined;
    }
    return undefined;
};

export const AUTH_HEADER = 'X-Auth-Token';

const PRIVATE_PATHS = /^\/api\/(auth|basket|favorite|order|steam\/create|codes\/create|payment\/cancel)(\/|\?|$)/;

export const needsAuth = (path) => PRIVATE_PATHS.test(String(path || '').replace(/^https?:\/\/[^/]+/, ''));

export const withAuthHeaders = (path, headers = {}) => {
    const token = needsAuth(path) ? getAuthToken() : null;
    return token ? {...headers, [AUTH_HEADER]: token} : headers;
};
