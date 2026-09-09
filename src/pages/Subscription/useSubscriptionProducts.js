import {useCallback, useEffect, useState} from 'react';
import {fetchCatalogProducts} from '../../shared/api/catalog';
import {useProductStore} from '../../store/useProductStore';

const PER_PAGE = 60;
const MAX_PAGES = 6;

export function useSubscriptionProducts(catalogId, seed) {
    const [state, setState] = useState({items: seed?.length ? seed : null, error: false, attempt: 0});

    const rememberPreviews = useProductStore((store) => store.rememberPreviews);

    useEffect(() => {
        if (catalogId === null || catalogId === undefined) return undefined;

        const controller = new AbortController();

        const load = async () => {
            const collected = [];

            for (let page = 1; page <= MAX_PAGES; page += 1) {
                const payload = await fetchCatalogProducts(
                    {catalogId, page, perPage: PER_PAGE},
                    controller.signal
                );

                collected.push(...(Array.isArray(payload?.items) ? payload.items : []));
                if (!payload?.hasMore) break;
            }

            return collected;
        };

        load()
            .then((items) => {
                if (controller.signal.aborted) return;
                rememberPreviews(items);
                setState((prev) => ({...prev, items, error: false}));
            })
            .catch(() => {
                if (controller.signal.aborted) return;
                setState((prev) => ({...prev, error: prev.items === null}));
            });

        return () => controller.abort();
    }, [catalogId, state.attempt, rememberPreviews]);

    const retry = useCallback(() => {
        setState((prev) => ({...prev, error: false, attempt: prev.attempt + 1}));
    }, []);

    return {items: state.items, error: state.error, retry};
}
