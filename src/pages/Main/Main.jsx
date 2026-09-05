import React, {useCallback, useEffect, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {useScrollMemory} from '../../shared/hooks/useScrollMemory';
import {hapticImpact} from '../../shared/lib/haptic';
import {primeKeyboard} from '../../shared/lib/keyboard';
import {loadFacets} from '../../shared/api/facetsCache';
import {catalogEntry, productEntry, subscriptionTarget} from '../../shared/lib/subscriptionCatalogs';
import {useCodeCatalog} from '../Services/useCodeCatalog';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import BannerCarousel from './BannerCarousel';
import CatalogSection from './CatalogSection';
import CatalogSkeleton from './CatalogSkeleton';
import {selectPageBanners} from './bannerFormat';
import {buildSections} from './catalogSections';
import style from './Main.module.scss';

export default function Main() {
    const navigate = useNavigate();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();

    const pageId = useSessionStore((state) => state.pageId);
    const banners = useStructureStore((state) => state.banners);
    const structureBlocks = useStructureStore((state) => state.structureBlocks);
    const catalogs = useStructureStore((state) => state.catalogs);
    const mainPageProducts = useStructureStore((state) => state.mainPageProducts);

    const {brands} = useCodeCatalog();

    const sections = useMemo(
        () => buildSections({structureBlocks, catalogs, mainPageProducts, pageId}),
        [structureBlocks, catalogs, mainPageProducts, pageId]
    );

    const screenRef = useScrollMemory(`main:${pageId}`, {ready: sections !== null});

    useEffect(() => {
        if (pageId === null) return;
        loadFacets({pageId}).catch(() => undefined);
    }, [pageId]);

    const openSearch = useCallback(() => {
        hapticImpact('light');
        primeKeyboard();
        navigate('/search');
    }, [navigate]);

    const openCatalog = useCallback((path) => {
        hapticImpact('light');
        navigate(`/catalog/${String(path || '').replace(/^\//, '')}`);
    }, [navigate]);

    const openProduct = useCallback((product) => {
        hapticImpact('light');
        navigate(`/card/${product.id}`);
    }, [navigate]);

    const subscriptionOf = useCallback((section) => (
        catalogEntry(brands, section.catalogId, section.products)
        || productEntry(brands, section.products[0]?.id, section.products)
    ), [brands]);

    const openSubscription = useCallback((entry, tierKey) => {
        hapticImpact('light');
        navigate('/subscription', {state: subscriptionTarget(entry, tierKey)});
    }, [navigate]);

    const openBannerSubscription = useCallback((productId) => {
        const entry = productEntry(brands, productId, mainPageProducts);
        if (!entry) return false;

        hapticImpact('light');
        navigate('/subscription', {state: subscriptionTarget(entry, entry.offer?.groupName ?? null)});

        return true;
    }, [brands, mainPageProducts, navigate]);

    return (
        <div
            ref={screenRef}
            className={style.screen}
            style={{
                paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`,
                paddingBottom: `calc(${safeAreaInset.bottom}px + 24 * var(--u))`
            }}
        >
            <button type="button" className={style.search} onClick={openSearch}>
                <svg className={style.searchIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="10.6" cy="10.6" r="6.7" stroke="currentColor" strokeWidth="1.9"/>
                    <path d="m15.6 15.6 5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
                </svg>
                <span className={style.searchText}>Поиск игры, подписки, доната</span>
            </button>

            <BannerCarousel
                items={selectPageBanners(banners, pageId)}
                onOpenSubscription={openBannerSubscription}
            />

            {sections === null ? (
                <CatalogSkeleton/>
            ) : sections.length === 0 ? (
                <EmptyState
                    icon="🗂"
                    title="Здесь пока пусто"
                    text="У этой витрины ещё не собраны разделы. Загляните позже или выберите другую."
                    actionLabel="Сменить витрину"
                    onAction={() => navigate('/')}
                />
            ) : sections.map((section) => (
                <CatalogSection
                    key={section.block.id}
                    section={section}
                    subscription={subscriptionOf(section)}
                    onOpenCatalog={openCatalog}
                    onOpenProduct={openProduct}
                    onOpenSubscription={openSubscription}
                />
            ))}
        </div>
    );
}
