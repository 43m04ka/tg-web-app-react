import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useSessionStore, selectUserId} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {useCartStore, selectCartCount} from '../../store/useCartStore';
import {useFavoriteStore, selectIsFavorite} from '../../store/useFavoriteStore';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {useBackButton} from '../../shared/hooks/useBackButton';
import {hapticImpact, hapticSelection} from '../../shared/lib/haptic';
import {getTelegramObject} from '../../shared/lib/telegram';
import {shareText, productLink} from './productView';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import ProductCard from '../Main/ProductCard';
import BackPill from '../../shared/ui/BackPill/BackPill';
import ProductChips from './ProductChips';
import ProductShare from './ProductShare';
import {discountPercent} from '../Main/catalogSections';
import ProductHero from './ProductHero';
import ProductEditions from './ProductEditions';
import ProductAddons from './ProductAddons';
import ProductOffer from './ProductOffer';
import ProductDescription from './ProductDescription';
import ProductGallery from './ProductGallery';
import ProductSpecs from './ProductSpecs';
import ProductBuyBar from './ProductBuyBar';
import ProductSkeleton from './ProductSkeleton';
import ProductVideo from './ProductVideo';
import StarRating from './StarRating';
import {useProduct, useRecommendations} from './useProduct';
import {recallProduct} from './productCache';
import {
    buildChips,
    buildSpecs,
    editionLabels,
    eyebrow,
    isPurchasable,
    promotionLabel,
    subscriptionOffer
} from './productView';
import style from './Product.module.scss';

const PARALLAX_RATIO = 0.32;
const PARALLAX_LIMIT = 260;

export default function Product() {
    const {id} = useParams();
    const productId = Number(id);

    const navigate = useNavigate();
    const {safeAreaInset, contentSafeAreaInset} = useAppInsets();
    const {isTg} = usePlatform();

    const userId = useSessionStore(selectUserId);
    const pageId = useSessionStore((state) => state.pageId);
    const catalogs = useStructureStore((state) => state.catalogs);
    const mainPageProducts = useStructureStore((state) => state.mainPageProducts);

    const seed = useMemo(
        () => recallProduct(productId)
            || (mainPageProducts || []).find((item) => item.id === productId)
            || null,
        [mainPageProducts, productId]
    );

    const {product, error, reload} = useProduct(productId, seed);

    const loadCart = useCartStore((state) => state.load);
    const addToCart = useCartStore((state) => state.add);
    const setCartCount = useCartStore((state) => state.setCount);
    const cartCount = useCartStore(selectCartCount(productId));

    const loadFavorites = useFavoriteStore((state) => state.load);
    const toggleFavorite = useFavoriteStore((state) => state.toggle);
    const isFavorite = useFavoriteStore(selectIsFavorite(productId));

    const screenRef = useRef(null);
    const heroRef = useRef(null);
    const frameRef = useRef(0);
    const keepScrollRef = useRef(false);

    const [selectedAddonIds, setSelectedAddonIds] = useState(() => new Set());
    const [isAdding, setIsAdding] = useState(false);
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    const goBack = useCallback(() => {
        hapticImpact('light');
        if (window.history.length > 1) navigate(-1);
        else navigate('/main');
    }, [navigate]);

    const hasNativeBack = useBackButton(goBack);

    useEffect(() => {
        loadCart(userId);
        loadFavorites(userId);
    }, [userId, loadCart, loadFavorites]);

    useEffect(() => {
        setSelectedAddonIds(new Set());
        setIsVideoOpen(false);

        if (keepScrollRef.current) {
            keepScrollRef.current = false;
            return;
        }

        if (screenRef.current) screenRef.current.scrollTop = 0;
    }, [productId]);

    useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

    const handleScroll = useCallback((event) => {
        const {scrollTop} = event.currentTarget;

        cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(() => {
            const shift = Math.min(scrollTop, PARALLAX_LIMIT) * PARALLAX_RATIO;
            heroRef.current?.style.setProperty('--parallax', `${shift}px`);
        });
    }, []);

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

    const openProduct = useCallback((next) => {
        if (!next || next.id === productId) return;
        hapticImpact('light');
        navigate(`/card/${next.id}`);
    }, [navigate, productId]);

    const selectEdition = useCallback((next) => {
        if (!next || next.id === productId) return;
        hapticSelection();
        keepScrollRef.current = true;
        navigate(`/card/${next.id}`, {replace: true});
    }, [navigate, productId]);

    const toggleAddon = useCallback((addon) => {
        hapticSelection();
        setSelectedAddonIds((prev) => {
            const next = new Set(prev);
            if (next.has(addon.id)) next.delete(addon.id);
            else next.add(addon.id);
            return next;
        });
    }, []);

    const handleFavorite = useCallback(() => {
        hapticImpact('light');
        toggleFavorite(userId, productId);
    }, [toggleFavorite, userId, productId]);

    const handlePlay = useCallback(() => {
        if (!product?.videoUrl) return;
        hapticImpact('light');
        setIsVideoOpen(true);
    }, [product]);

    const openVideoOutside = useCallback(() => {
        const url = product?.videoUrl;
        if (!url) return;

        setIsVideoOpen(false);

        const tg = getTelegramObject();
        if (typeof tg.openLink === 'function') tg.openLink(url);
        else window.open(url, '_blank', 'noopener');
    }, [product]);

    const addAllToCart = useCallback(async () => {
        if (!product || isAdding) return;

        hapticImpact('medium');
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

    const changeCount = useCallback((next) => {
        hapticSelection();
        setCartCount(userId, productId, next);
    }, [setCartCount, userId, productId]);

    const openBasket = useCallback(() => {
        hapticImpact('light');
        navigate('/basket');
    }, [navigate]);

    const openCatalog = useCallback((route) => {
        hapticImpact('light');
        navigate(route);
    }, [navigate]);

    const topPadding = contentSafeAreaInset.top;

    const floatingBack = hasNativeBack ? null : (
        <BackPill
            className={style.floatingBack}
            style={{top: `calc(${topPadding}px + 10 * var(--u))`}}
            onClick={goBack}
        />
    );

    if (error) {
        return (
            <div className={style.screen} style={{paddingTop: `calc(${topPadding}px + 14 * var(--u))`}}>
                {floatingBack}
                <EmptyState
                    tone="danger"
                    icon="⚠"
                    title="Товар не открылся"
                    text="Возможно, его убрали с витрины или пропала связь. Попробуйте ещё раз."
                    actionLabel="Повторить"
                    onAction={reload}
                />
            </div>
        );
    }

    if (!product) {
        return (
            <div className={style.screen}>
                {floatingBack}
                <ProductSkeleton/>
            </div>
        );
    }

    const discount = discountPercent(product.price, product.oldPrice);
    const promoUntil = discount > 0 ? promotionLabel(product) : null;
    const chips = buildChips(product);
    const specs = buildSpecs(product);
    const link = productLink(product, isTg);

    const total = Number(product.price) + selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0);
    const oldTotal = discount > 0
        ? Number(product.oldPrice) + selectedAddons.reduce((sum, addon) => sum + Number(addon.oldPrice || addon.price), 0)
        : null;

    return (
        <div className={style.screen} ref={screenRef} onScroll={handleScroll}>
            <ProductHero
                ref={heroRef}
                product={product}
                topInset={topPadding}
                showBack={!hasNativeBack}
                discount={discount}
                promoUntil={promoUntil}
                isFavorite={isFavorite}
                onBack={goBack}
                onPlay={handlePlay}
                onToggleFavorite={handleFavorite}
            />

            <div className={style.body}>
                <section className={style.head}>
                    {eyebrow(product) ? <span className={style.eyebrow}>{eyebrow(product)}</span> : null}
                    <h1 className={style.title}>{product.name}</h1>
                    <StarRating rating={product.starRating}/>
                </section>

                <ProductChips chips={chips}/>

                <ProductEditions editions={editions} activeId={productId} onSelect={selectEdition}/>

                <ProductAddons addons={addons} selectedIds={selectedAddonIds} onToggle={toggleAddon}/>

                <ProductOffer offer={offer} route={offerRoute} onOpen={openCatalog}/>

                <ProductDescription description={product.description}/>

                <ProductGallery images={product.descriptionImages}/>

                <ProductSpecs specs={specs}/>

                <ProductShare
                    productId={product.id}
                    userId={userId}
                    text={shareText(product, specs, link)}
                    link={link}
                />

                {recommendations?.length ? (
                    <section className={style.section}>
                        <h2 className={style.sectionTitle}>С этим товаром берут</h2>
                        <div className={style.shelf}>
                            {recommendations.map((item) => (
                                <ProductCard key={item.id} product={item} onOpen={openProduct}/>
                            ))}
                        </div>
                    </section>
                ) : null}
            </div>

            <ProductBuyBar
                total={total}
                oldTotal={oldTotal}
                isAvailable={isPurchasable(product)}
                count={cartCount}
                isBusy={isAdding}
                bottomInset={safeAreaInset.bottom}
                onAdd={addAllToCart}
                onChangeCount={changeCount}
                onOpenBasket={openBasket}
            />

            {isVideoOpen ? (
                <ProductVideo
                    url={product.videoUrl}
                    onClose={() => setIsVideoOpen(false)}
                    onFallback={openVideoOutside}
                />
            ) : null}
        </div>
    );
}
