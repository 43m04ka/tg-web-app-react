import {useEffect, useState} from 'react';
import {searchProducts} from '../../shared/api/catalog';
import {recallView, rememberView} from '../../shared/lib/viewMemory';
import {useProductStore} from '../../store/useProductStore';

const DEBOUNCE_MS = 320;
const MIN_QUERY_LENGTH = 2;

const IDLE = {items: null, suggestions: [], isLoading: false, error: false, isRestored: false};

const cacheKeyOf = (requestKey) => `search:${requestKey}`;

const fromCache = (requestKey) => {
    const cached = recallView(cacheKeyOf(requestKey));

    return cached ? {...cached, isRestored: true} : null;
};

export function useSearchResults({query, scope, filters, sorting}) {
    const trimmed = String(query || '').trim();
    const requestKey = JSON.stringify({query: trimmed, scope, filters, sorting});

    const [state, setState] = useState(() => fromCache(requestKey) || IDLE);

    const rememberPreviews = useProductStore((store) => store.rememberPreviews);

    useEffect(() => {
        const request = JSON.parse(requestKey);

        if (request.query.length < MIN_QUERY_LENGTH) {
            setState(IDLE);
            return undefined;
        }

        const cached = fromCache(requestKey);

        if (cached) {
            setState(cached);
            return undefined;
        }

        const controller = new AbortController();

        setState((prev) => ({...prev, isLoading: true, error: false}));

        const timer = setTimeout(() => {
            searchProducts({
                ...request.scope,
                query: request.query,
                filters: request.filters,
                sorting: request.sorting
            }, controller.signal)
                .then((payload) => {
                    const items = Array.isArray(payload?.items) ? payload.items : [];
                    const suggestions = Array.isArray(payload?.suggestions) ? payload.suggestions : [];

                    rememberPreviews(items);
                    rememberPreviews(suggestions);

                    const next = {items, suggestions, isLoading: false, error: false, isRestored: false};

                    rememberView(cacheKeyOf(requestKey), next);
                    setState(next);
                })
                .catch(() => {
                    if (controller.signal.aborted) return;
                    setState({...IDLE, error: true});
                });
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [requestKey, rememberPreviews]);

    return state;
}

export {MIN_QUERY_LENGTH};
