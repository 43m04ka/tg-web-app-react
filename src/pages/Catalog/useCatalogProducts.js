import {useCallback, useEffect, useRef, useState} from 'react';
import {fetchCatalogProducts} from '../../shared/api/catalog';
import {recallView, rememberView} from '../../shared/lib/viewMemory';
import {useProductStore} from '../../store/useProductStore';

const blank = (key) => ({
    key,
    page: 1,
    attempt: 0,
    items: null,
    total: 0,
    hasMore: false,
    isLoading: true,
    error: false,
    isRestored: false
});

const restore = (key) => {
    const saved = recallView(`list:${key}`);

    return saved
        ? {...saved, key, attempt: 0, isLoading: false, error: false, isRestored: true}
        : blank(key);
};

const stampOf = (state) => (state.items === null ? null : `${state.key}|${state.page}|${state.attempt}`);

export function useCatalogProducts(query, {enabled = true} = {}) {
    const key = JSON.stringify(query);
    const [state, setState] = useState(() => restore(key));
    const loadedRef = useRef(stampOf(state));

    const rememberPreviews = useProductStore((store) => store.rememberPreviews);

    if (state.key !== key) {
        const next = restore(key);
        setState(next);
        loadedRef.current = stampOf(next);
    }

    const {page, attempt} = state;
    const stamp = `${key}|${page}|${attempt}`;

    useEffect(() => {
        if (!enabled || loadedRef.current === stamp) return undefined;

        loadedRef.current = stamp;

        const controller = new AbortController();

        const isCurrent = (prev) => prev.key === key && prev.page === page && prev.attempt === attempt;

        setState((prev) => (isCurrent(prev) ? {...prev, isLoading: true, error: false} : prev));

        fetchCatalogProducts({...JSON.parse(key), page}, controller.signal)
            .then((payload) => {
                const items = Array.isArray(payload?.items) ? payload.items : [];
                rememberPreviews(items);

                setState((prev) => (isCurrent(prev) ? {
                    ...prev,
                    items: page === 1 ? items : [...(prev.items || []), ...items],
                    total: payload?.total ?? 0,
                    hasMore: Boolean(payload?.hasMore),
                    isLoading: false,
                    error: false
                } : prev));
            })
            .catch(() => {
                if (controller.signal.aborted) return;
                loadedRef.current = null;
                setState((prev) => (isCurrent(prev) ? {...prev, isLoading: false, error: true} : prev));
            });

        return () => controller.abort();
    }, [stamp, key, page, attempt, enabled, rememberPreviews]);

    useEffect(() => {
        if (state.items === null || state.isLoading || state.error) return;

        rememberView(`list:${state.key}`, {
            page: state.page,
            items: state.items,
            total: state.total,
            hasMore: state.hasMore
        });
    }, [state]);

    const loadMore = useCallback(() => {
        setState((prev) => (prev.hasMore && !prev.isLoading ? {...prev, page: prev.page + 1} : prev));
    }, []);

    const retry = useCallback(() => {
        setState((prev) => ({...prev, attempt: prev.attempt + 1}));
    }, []);

    return {
        items: state.items,
        total: state.total,
        hasMore: state.hasMore,
        isLoading: state.isLoading,
        isLoadingMore: state.isLoading && state.page > 1,
        isRestored: state.isRestored,
        error: state.error,
        loadMore,
        retry
    };
}
