import {useCallback, useEffect, useRef, useState} from 'react';
import {fetchProduct, fetchRecommendations} from '../../shared/api/product';

const RECOMMENDATION_LIMIT = 10;

export function useProduct(productId, seed) {
    const [product, setProduct] = useState(seed || null);
    const [error, setError] = useState(null);
    const [reloadToken, setReloadToken] = useState(0);

    const seedRef = useRef(seed);
    seedRef.current = seed;

    const reload = useCallback(() => setReloadToken((token) => token + 1), []);

    useEffect(() => {
        setProduct(seedRef.current || null);
        setError(null);

        if (!Number.isFinite(productId)) {
            setError(new Error('Некорректная ссылка на товар'));
            return undefined;
        }

        const controller = new AbortController();

        fetchProduct(productId, controller.signal)
            .then((data) => {
                if (controller.signal.aborted) return;

                if (!data || !data.id) {
                    setError(new Error('Товар не найден'));
                    return;
                }

                setProduct(data);
            })
            .catch((loadError) => {
                if (controller.signal.aborted) return;
                console.error('[product]', loadError.message);
                if (!seedRef.current) setError(loadError);
            });

        return () => controller.abort();
    }, [productId, reloadToken]);

    return {product, error, reload};
}

export function useRecommendations(pageId, excludedIds) {
    const [items, setItems] = useState(null);

    useEffect(() => {
        if (pageId === null || pageId === undefined) return undefined;

        const controller = new AbortController();

        fetchRecommendations(pageId, controller.signal).then((result) => {
            if (controller.signal.aborted) return;
            setItems(Array.isArray(result) ? result : []);
        });

        return () => controller.abort();
    }, [pageId]);

    if (items === null) return null;

    return items
        .filter((item) => Number(item.price) > 0 && !excludedIds.has(item.id))
        .slice(0, RECOMMENDATION_LIMIT);
}
