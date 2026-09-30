import {useEffect, useMemo, useState} from 'react';
import {useStructureStore} from '../../../store/useStructureStore';
import {usePlatform} from '../../../shared/hooks/usePlatform';
import {searchProducts} from '../../../shared/api/catalog';
import {createProductOrigin} from '../../../shared/lib/productOrigin';
import {familyOf, mergeOffers, offerKey} from '../../model/storefrontModel';
import {resolveBotType, storefrontList} from '../../model/desktopNav';

const cache = new Map();

const lookup = (query, botType) => {
    const key = `${botType}|${query}`;
    if (!cache.has(key)) {
        const request = searchProducts({query, allPages: true, botType, perPage: 24})
            .then((payload) => (Array.isArray(payload?.items) ? payload.items : []))
            .catch(() => {
                cache.delete(key);
                return [];
            });
        cache.set(key, request);
    }
    return cache.get(key);
};

export function useRegionOffers(product) {
    const {botType} = usePlatform();

    const pages = useStructureStore((store) => store.pages);
    const startPages = useStructureStore((store) => store.startPages);
    const catalogs = useStructureStore((store) => store.catalogs);

    const originOf = useMemo(
        () => createProductOrigin({catalogs, pages, startPages}),
        [catalogs, pages, startPages]
    );

    const storefrontIds = useMemo(
        () => new Set(storefrontList(startPages, pages, botType).map((item) => item.id)),
        [startPages, pages, botType]
    );

    const effectiveBotType = useMemo(() => resolveBotType(startPages, botType), [startPages, botType]);

    const [found, setFound] = useState(null);

    const name = String(product?.name || '').trim();

    useEffect(() => {
        setFound(null);
        if (!name) return undefined;

        let isAlive = true;
        lookup(name, effectiveBotType).then((items) => {
            if (isAlive) setFound(items);
        });

        return () => {
            isAlive = false;
        };
    }, [name, effectiveBotType]);

    return useMemo(() => {
        if (!product || !found) return null;

        const origin = originOf(product);
        if (!origin) return null;

        const key = offerKey(product, familyOf(origin.type));
        const candidates = [product, ...found.filter((item) => item.id !== product.id)]
            .filter((item) => storefrontIds.has(originOf(item)?.pageId));

        const offer = mergeOffers(candidates, originOf).find((item) => item.key === key);
        if (!offer || offer.origins.length < 2) return null;

        const best = offer.origins.find((item) => item.price !== null)?.price ?? null;

        return offer.origins.map((item) => ({
            pageId: item.pageId,
            label: item.label,
            title: item.title,
            icon: item.icon,
            price: item.price,
            product: item.product,
            isCurrent: item.pageId === origin.pageId,
            isBest: item.price !== null && item.price === best
        }));
    }, [product, found, originOf, storefrontIds]);
}
