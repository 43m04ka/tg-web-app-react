import {API_BASE_URL} from '../config/env';

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

export async function request(path, {
    method = 'GET',
    query,
    body,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    cache = false
} = {}) {
    const url = buildUrl(path, cache ? query : {...query, time: Date.now()});
    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
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

            return await response.json();
        } catch (error) {
            lastError = error instanceof ApiError
                ? error
                : new ApiError(error.message || 'Network error', {url, cause: error});

            if (signal?.aborted) throw lastError;
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
