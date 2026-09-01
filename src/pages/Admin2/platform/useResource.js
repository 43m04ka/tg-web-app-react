import {useCallback, useEffect, useReducer, useRef} from 'react';
import {ensureLoaded, getEntry, keyOf, registerFetcher, revalidate, subscribe} from './cache';

export function useResource(key, fetcher, options = {}) {
    const {enabled = true, refreshMs = 0} = options;
    const cacheKey = keyOf(key);

    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    const [, bump] = useReducer((value) => value + 1, 0);

    useEffect(() => {
        if (!enabled) return undefined;

        registerFetcher(cacheKey, () => fetcherRef.current());
        const unsubscribe = subscribe(cacheKey, bump);
        ensureLoaded(cacheKey);

        return unsubscribe;
    }, [cacheKey, enabled]);

    useEffect(() => {
        if (!enabled || !refreshMs) return undefined;

        const timerId = setInterval(() => {
            if (!document.hidden) revalidate(cacheKey);
        }, refreshMs);

        return () => clearInterval(timerId);
    }, [cacheKey, enabled, refreshMs]);

    const refresh = useCallback(() => revalidate(cacheKey), [cacheKey]);

    const entry = getEntry(cacheKey) || {};

    return {
        data: entry.data === undefined ? null : entry.data,
        error: entry.error || null,
        isLoading: Boolean(entry.loading) && entry.data === undefined,
        isStale: Boolean(entry.stale),
        updatedAt: entry.updatedAt || 0,
        refresh,
    };
}
