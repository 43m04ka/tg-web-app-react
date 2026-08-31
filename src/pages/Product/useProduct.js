import {useCallback, useEffect, useRef, useState} from 'react';
import {fetchProduct, fetchRecommendations} from '../../shared/api/product';
import {useProductStore, selectProductEntry} from '../../store/useProductStore';

const RECOMMENDATION_LIMIT = 10;

export function useProduct(productId, preview) {
    const entry = useProductStore(selectProductEntry(productId));
    const remember = useProductStore((state) => state.remember);
    const rememberPreview = useProductStore((state) => state.rememberPreview);

    const [error, setError] = useState(null);
    const [reloadToken, setReloadToken] = useState(0);

    const isForcedRef = useRef(false);

    const reload = useCallback(() => {
        isForcedRef.current = true;
        setReloadToken((token) => token + 1);
    }, []);

    useEffect(() => {
        if (preview) rememberPreview(preview);
    }, [preview, rememberPreview]);

    useEffect(() => {
        setError(null);

        if (!Number.isFinite(productId)) {
            setError(new Error('Некорректная ссылка на товар'));
            return undefined;
        }

        const isForced = isForcedRef.current;
        isForcedRef.current = false;

        if (!isForced && useProductStore.getState().isFresh(productId)) return undefined;

        const controller = new AbortController();

        fetchProduct(productId, controller.signal)
            .then((data) => {
                if (controller.signal.aborted) return;

                if (!data || !data.id) {
                    if (!useProductStore.getState().entries[productId]) {
                        setError(new Error('Товар не найден'));
                    }
                    return;
                }

                remember(data, true);
            })
            .catch((loadError) => {
                if (controller.signal.aborted) return;
                console.error('[product]', loadError.message);
                if (!useProductStore.getState().entries[productId]) setError(loadError);
            });

        return () => controller.abort();
    }, [productId, reloadToken, remember]);

    return {product: entry?.product || preview || null, error, reload};
}

export function useRecommendations(pageId, excludedIds) {
    const [items, setItems] = useState(() => useProductStore.getState().recallShelf(pageId));

    useEffect(() => {
        if (pageId === null || pageId === undefined) return undefined;

        const known = useProductStore.getState().recallShelf(pageId);
        if (known) {
            setItems(known);
            return undefined;
        }

        const controller = new AbortController();

        fetchRecommendations(pageId, controller.signal).then((result) => {
            if (controller.signal.aborted) return;

            const list = Array.isArray(result) ? result : [];
            const store = useProductStore.getState();

            store.rememberShelf(pageId, list);
            store.rememberPreviews(list);
            setItems(list);
        });

        return () => controller.abort();
    }, [pageId]);

    if (items === null) return null;

    return items
        .filter((item) => Number(item.price) > 0 && !excludedIds.has(item.id))
        .slice(0, RECOMMENDATION_LIMIT);
}
