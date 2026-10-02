import {API_BASE_URL, DIRECT_API_URL, IS_TUNNEL_HOST} from '../config/env';
import {reportDirectFailure} from '../lib/paymentNetwork';
import {rewriteUploads} from '../lib/uploads';

const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_RETRIES = 1;

export class ApiError extends Error {
    constructor(message, {status = null, url = '', cause = null} = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.url = url;
        this.cause = cause;
    }
}

const buildUrl = (path, query) => {
    const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`);
    Object.entries(query || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    });
    return url.toString();
};

const withTimeout = (signal, timeoutMs) => {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeoutMs);

    if (signal) {
        if (signal.aborted) controller.abort();
        else signal.addEventListener('abort', () => controller.abort(), {once: true});
    }

    return {signal: controller.signal, dispose: () => clearTimeout(timerId)};
};

const isDirectNetworkError = (url, error) =>
    IS_TUNNEL_HOST && error.status === null && url.startsWith(DIRECT_API_URL);

export async function apiFetch(path, init = {}) {
    const url = `${API_BASE_URL}${path}`;

    try {
        return await fetch(url, init);
    } catch (error) {
        if (!IS_TUNNEL_HOST || !url.startsWith(DIRECT_API_URL) || init.signal?.aborted) throw error;

        reportDirectFailure();
        return fetch(`${API_BASE_URL}${path}`, init);
    }
}

export async function request(path, {
    method = 'GET',
    query,
    body,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    cache = false
} = {}) {
    const params = cache ? query : {...query, time: Date.now()};
    let url = '';
    let lastError = null;
    let fellBack = false;

    for (let attempt = 0; attempt <= retries; attempt++) {
        url = buildUrl(path, params);
        const timeout = withTimeout(signal, timeoutMs);

        try {
            const response = await fetch(url, {
                method,
                headers: {'Content-Type': 'application/json'},
                body: body === undefined ? undefined : JSON.stringify(body),
                signal: timeout.signal
            });

            if (!response.ok) {
                throw new ApiError(`HTTP ${response.status}`, {status: response.status, url});
            }

            return rewriteUploads(await response.json());
        } catch (error) {
            lastError = error instanceof ApiError
                ? error
                : new ApiError(error.message || 'Network error', {url, cause: error});

            if (signal?.aborted) throw lastError;

            if (!fellBack && isDirectNetworkError(url, lastError)) {
                fellBack = true;
                reportDirectFailure();
                attempt -= 1;
            }
        } finally {
            timeout.dispose();
        }
    }

    throw lastError;
}

export async function requestResult(path, options) {
    const payload = await request(path, options);
    return payload?.result ?? null;
}

export async function safeRequestResult(path, options) {
    try {
        return await requestResult(path, options);
    } catch (error) {
        console.error(`[api] ${path}:`, error.message);
        return null;
    }
}
