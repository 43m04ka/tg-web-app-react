import {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {selectUserId, useSessionStore} from '../../../store/useSessionStore';
import {useStructureStore} from '../../../store/useStructureStore';
import {selectCartCount, useCartStore} from '../../../store/useCartStore';
import {selectIsFavorite, useFavoriteStore} from '../../../store/useFavoriteStore';
import {useProduct, useRecommendations} from '../../../pages/Product/useProduct';
import {editionLabels, subscriptionOffer} from '../../../pages/Product/productView';
import {isSubscription} from '../../../pages/Main/catalogSections';
import {subscriptionRoute} from '../../../shared/lib/pageRoutes';

export function useDesktopProduct(productId) {
    const navigate = useNavigate();

    const userId = useSessionStore(selectUserId);
    const pageId = useSessionStore((store) => store.pageId);
    const setPageId = useSessionStore((store) => store.setPageId);
    const catalogs = useStructureStore((store) => store.catalogs);
    const mainPageProducts = useStructureStore((store) => store.mainPageProducts);

    const preview = useMemo(
        () => (mainPageProducts || []).find((item) => item.id === productId) || null,
        [mainPageProducts, productId]
    );

    const {product, error, reload} = useProduct(productId, preview);

    const loadCart = useCartStore((store) => store.load);
    const addToCart = useCartStore((store) => store.add);
    const setCartCount = useCartStore((store) => store.setCount);
    const cartCount = useCartStore(selectCartCount(productId));

    const loadFavorites = useFavoriteStore((store) => store.load);
    const toggleFavorite = useFavoriteStore((store) => store.toggle);
    const isFavorite = useFavoriteStore(selectIsFavorite(productId));

    const [selectedAddonIds, setSelectedAddonIds] = useState(() => new Set());
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadCart(userId);
        loadFavorites(userId);
    }, [userId, loadCart, loadFavorites]);

    useEffect(() => {
        setSelectedAddonIds(new Set());
    }, [productId]);

    const editions = useMemo(() => {
        if (!product) return [];

        const list = [product, ...(product.conceptProducts || [])]
            .filter((item) => item && item.id)
            .filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index)
            .sort((a, b) => Number(a.price) - Number(b.price));

        const labels = editionLabels(list.map((item) => item.name));

        return list.map((item, index) => ({product: item, label: labels[index]}));
    }, [product]);

    const addons = useMemo(
        () => (product?.conceptAddOns || []).filter((item) => item && item.id && Number(item.price) > 0),
        [product]
    );

    const excludedIds = useMemo(() => {
        const ids = new Set([productId]);
        editions.forEach((edition) => ids.add(edition.product.id));
        addons.forEach((addon) => ids.add(addon.id));
        return ids;
    }, [productId, editions, addons]);

    const recommendations = useRecommendations(pageId, excludedIds);

    const productPageId = useMemo(() => {
        if (!product || !Array.isArray(catalogs)) return null;
        return catalogs.find((item) => item.id === product.catalogId)?.structurePageId ?? null;
    }, [product, catalogs]);

    useEffect(() => {
        if (productPageId === null || productPageId === pageId) return;
        setPageId(productPageId);
    }, [productPageId, pageId, setPageId]);

    const isPlan = Boolean(product) && isSubscription(product);

    const planRoute = useMemo(() => {
        if (!isPlan || !Array.isArray(catalogs)) return null;

        const path = catalogs.find((item) => item.id === product.catalogId)?.path;
        return path ? subscriptionRoute(path, product.id) : null;
    }, [isPlan, product, catalogs]);

    const offer = useMemo(() => (product ? subscriptionOffer(product) : null), [product]);

    const offerRoute = useMemo(() => {
        if (!offer?.catalogSuffix) return null;

        const catalog = (catalogs || []).find((item) =>
            item.structurePageId === pageId && String(item.path || '').endsWith(offer.catalogSuffix));

        return catalog ? `/catalog/${catalog.path}` : null;
    }, [offer, catalogs, pageId]);

    const selectedAddons = useMemo(
        () => addons.filter((addon) => selectedAddonIds.has(addon.id)),
        [addons, selectedAddonIds]
    );

    const toggleAddon = useCallback((addon) => {
        setSelectedAddonIds((prev) => {
            const next = new Set(prev);
            if (next.has(addon.id)) next.delete(addon.id);
            else next.add(addon.id);
            return next;
        });
    }, []);

    const selectEdition = useCallback((next) => {
        if (!next || next.id === productId) return;
        navigate(`/card/${next.id}`, {replace: true});
    }, [navigate, productId]);

    const openProduct = useCallback((next) => {
        if (!next || next.id === productId) return;
        navigate(`/card/${next.id}`);
    }, [navigate, productId]);

    const addAllToCart = useCallback(async () => {
        if (!product || isAdding) return;

        setIsAdding(true);

        try {
            await addToCart(userId, product);
            for (const addon of selectedAddons) {
                await addToCart(userId, addon);
            }
        } finally {
            setIsAdding(false);
        }
    }, [product, isAdding, addToCart, userId, selectedAddons]);

    const changeCount = useCallback(
        (next) => setCartCount(userId, productId, next),
        [setCartCount, userId, productId]
    );

    const handleFavorite = useCallback(
        () => toggleFavorite(userId, productId),
        [toggleFavorite, userId, productId]
    );

    return {
        product,
        error,
        reload,
        catalogs,
        planRoute,
        editions,
        addons,
        selectedAddonIds,
        selectedAddons,
        offer,
        offerRoute,
        recommendations,
        cartCount,
        isFavorite,
        isAdding,
        toggleAddon,
        selectEdition,
        openProduct,
        addAllToCart,
        changeCount,
        handleFavorite
    };
}
