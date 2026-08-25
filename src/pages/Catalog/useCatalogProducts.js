import {useCallback, useEffect, useState} from 'react';
import {fetchCatalogProducts} from '../../shared/api/catalog';
import {useProductStore} from '../../store/useProductStore';

const blank = (key) => ({
    key,
    page: 1,
    attempt: 0,
    items: null,
    total: 0,
    hasMore: false,
    isLoading: true,
    error: false
});

export function useCatalogProducts(query, {enabled = true} = {}) {
    const key = JSON.stringify(query);
    const [state, setState] = useState(() => blank(key));

    const rememberPreviews = useProductStore((store) => store.rememberPreviews);

    if (state.key !== key) setState(blank(key));

    const {page, attempt} = state;

    useEffect(() => {
        if (!enabled) return undefined;

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
                setState((prev) => (isCurrent(prev) ? {...prev, isLoading: false, error: true} : prev));
            });

        return () => controller.abort();
    }, [key, page, attempt, enabled, rememberPreviews]);

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
        error: state.error,
        loadMore,
        retry
    };
}
