import {API_BASE_URL} from '../../../shared/config/env';
import {getToken, reportUnauthorized} from './token';

const AREAS = {
    admin: '/api/admin',
    parsing: '/api/parsing',
    catalog: '/api/catalog',
    product: '/api/product',
    structure: '/api/structure',
    hosting: '/api/hosting',
    search: '/api/search',
    order: '/api/order',
    steam: '/api/steam',
    codes: '/api/codes',
    uploads: '/api/uploads',
    root: '',
};

const DEFAULT_TIMEOUT_MS = 15000;

export class HttpError extends Error {
    constructor(message, {status = null, hint = '', url = '', cause = null} = {}) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
        this.hint = hint;
        this.url = url;
        this.cause = cause;
    }
}

const buildUrl = (area, path, query) => {
    const prefix = AREAS[area] ?? AREAS.admin;
    const url = new URL(`${API_BASE_URL}${prefix}${path}`);

    Object.entries(query || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, String(item)));
        else url.searchParams.set(key, String(value));
    });

    return url.toString();
};

const readPayload = async (response) => {
    const type = response.headers.get('content-type') || '';

    if (response.status === 204) return null;
    if (!type.includes('application/json')) {
        const text = await response.text();
        return text || null;
    }

    try {
        return await response.json();
    } catch {
        return null;
    }
};

const messageOf = (payload, status) => {
    if (payload && typeof payload === 'object') {
        if (payload.error) return String(payload.error);
        if (payload.message) return String(payload.message);
    }
    if (typeof payload === 'string' && payload.trim()) return payload.trim();

    if (status === 401) return 'Нужно войти заново';
    if (status === 403) return 'Действие недоступно';
    if (status === 404) return 'Не найдено';
    if (status === 409) return 'Действие сейчас невозможно';
    if (status >= 500) return 'Сервер не ответил';

    return `Запрос не прошёл (${status})`;
};

const hintOf = (status) => {
    if (status === 409) return 'Сервер отказал по состоянию данных, а не по форме запроса';
    if (status >= 500) return 'Похоже на сбой на сервере, попробуйте повторить';
    return '';
};

const isIdempotent = (method) => method === 'GET' || method === 'HEAD';

const runOnce = async (url, {method, body, form, signal, timeoutMs}) => {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeoutMs);

    const onAbort = () => controller.abort();

    if (signal) {
        if (signal.aborted) controller.abort();
        else signal.addEventListener('abort', onAbort, {once: true});
    }

    const token = getToken();
    const headers = {};

    if (token) headers.Authorization = `Bearer ${token}`;
    if (!form && body !== undefined) headers['Content-Type'] = 'application/json';

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
            signal: controller.signal,
        });

        const payload = await readPayload(response);

        if (response.status === 401) {
            reportUnauthorized();
            throw new HttpError(messageOf(payload, 401), {status: 401, url});
        }

        if (!response.ok) {
            throw new HttpError(messageOf(payload, response.status), {
                status: response.status,
                hint: hintOf(response.status),
                url,
            });
        }

        return payload;
    } finally {
        clearTimeout(timerId);
        if (signal) signal.removeEventListener('abort', onAbort);
    }
};

export async function http(path, options = {}) {
    const {
        area = 'admin',
        method = 'GET',
        query,
        body,
        form,
        signal,
        timeoutMs = DEFAULT_TIMEOUT_MS,
    } = options;

    const url = buildUrl(area, path, method === 'GET' ? {...query, time: Date.now()} : query);
    const attempts = isIdempotent(method) ? 2 : 1;

    let lastError = null;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
            return await runOnce(url, {method, body, form, signal, timeoutMs});
        } catch (error) {
            if (error instanceof HttpError && error.status && error.status < 500) throw error;
            if (signal?.aborted) throw error;

            lastError = error instanceof HttpError
                ? error
                : new HttpError('Сеть недоступна', {url, cause: error});
        }
    }

    throw lastError;
}

export const httpGet = (path, options) => http(path, {...options, method: 'GET'});
export const httpPost = (path, body, options) => http(path, {...options, method: 'POST', body});
