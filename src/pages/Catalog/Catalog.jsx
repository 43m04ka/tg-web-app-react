import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useStructureStore} from '../../store/useStructureStore';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {useBackButton} from '../../shared/hooks/useBackButton';
import {useHidingHeader} from '../../shared/hooks/useHidingHeader';
import {useNearBottom} from '../../shared/hooks/useNearBottom';
import {useScrollMemory} from '../../shared/hooks/useScrollMemory';
import {hapticImpact} from '../../shared/lib/haptic';
import {recallView, rememberView} from '../../shared/lib/viewMemory';
import BackPill from '../../shared/ui/BackPill/BackPill';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import {fetchCatalogProducts} from '../../shared/api/catalog';
import {loadFacets, peekFacets} from '../../shared/api/facetsCache';
import {
    countActiveFilters,
    createFilters,
    describeFilters,
    productsPlural,
    sortingLabel
} from '../../shared/lib/catalogQuery';
import {cleanPath} from '../Main/catalogSections';
import {FunnelIcon, SortIcon} from './CatalogIcons';
import ProductGrid, {ProductGridSkeleton} from './ProductGrid';
import FilterSheet from './FilterSheet';
import {useCatalogProducts} from './useCatalogProducts';
import style from './Catalog.module.scss';

const SIMILAR_LIMIT = 6;

export default function Catalog() {
    const navigate = useNavigate();
    const params = useParams();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();

    const path = cleanPath(params['*'] || '');

    const catalogs = useStructureStore((state) => state.catalogs);
    const structureBlocks = useStructureStore((state) => state.structureBlocks);

    const catalogId = useMemo(
        () => (catalogs || []).find((catalog) => catalog.path === path)?.id ?? null,
        [catalogs, path]
    );

    const title = useMemo(
        () => (structureBlocks || []).find((block) => cleanPath(block.path) === path)?.name || 'Каталог',
        [structureBlocks, path]
    );

    const formKey = `catalog:form:${path}`;
    const saved = useRef(recallView(formKey)).current;

    const [filters, setFilters] = useState(() => saved?.filters || createFilters());
    const [sorting, setSorting] = useState(saved?.sorting || 'default');
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [{facets, price}, setFacetData] = useState(() => peekFacets({catalogId}));
    const [similar, setSimilar] = useState([]);

    const isMissing = Array.isArray(catalogs) && catalogId === null;

    const scope = useMemo(() => ({catalogId}), [catalogId]);

    const query = useMemo(() => ({...scope, filters, sorting}), [scope, filters, sorting]);

    const {items, total, hasMore, isLoading, isRestored, error, loadMore, retry} = useCatalogProducts(query, {
        enabled: catalogId !== null
    });

    const scrollRef = useScrollMemory(`catalog:${path}`, {ready: items !== null});
    const isHeaderHidden = useHidingHeader(scrollRef, {enabled: !isSheetOpen && items !== null});

    const sentinelRef = useNearBottom({
        rootRef: scrollRef,
        enabled: hasMore && !isLoading && !error,
        onReach: loadMore
    });

    const scopeKey = JSON.stringify(scope);

    useEffect(() => {
        rememberView(formKey, {filters, sorting});
    }, [formKey, filters, sorting]);

    useEffect(() => {
        if (catalogId === null) return undefined;

        let isAlive = true;

        loadFacets({catalogId})
            .then((value) => {
                if (isAlive) setFacetData(value);
            })
            .catch(() => undefined);

        return () => {
            isAlive = false;
        };
    }, [catalogId]);

    const isEmptyByFilters = items !== null && items.length === 0 && countActiveFilters(filters) > 0;

    useEffect(() => {
        if (!isEmptyByFilters || JSON.parse(scopeKey).catalogId === null) return undefined;

        const controller = new AbortController();

        fetchCatalogProducts(
            {...JSON.parse(scopeKey), page: 1, perPage: SIMILAR_LIMIT, sorting: 'discount'},
            controller.signal
        )
            .then((payload) => setSimilar(Array.isArray(payload?.items) ? payload.items : []))
            .catch(() => setSimilar([]));

        return () => controller.abort();
    }, [isEmptyByFilters, scopeKey]);

    const back = useCallback(() => {
        hapticImpact('light');
        if (window.history.length > 1) navigate(-1);
        else navigate('/main');
    }, [navigate]);

    const hasNativeBack = useBackButton(back);

    const openProduct = useCallback((product) => {
        hapticImpact('light');
        navigate(`/card/${product.id}`);
    }, [navigate]);

    const openSheet = useCallback(() => {
        hapticImpact('light');
        setSheetOpen(true);
    }, []);

    const applyFilters = useCallback((nextFilters, nextSorting) => {
        setFilters(nextFilters);
        setSorting(nextSorting);
        scrollRef.current?.scrollTo({top: 0, behavior: 'instant'});
    }, [scrollRef]);

    const resetFilters = useCallback(() => {
        hapticImpact('light');
        setFilters(createFilters());
        setSorting('default');
    }, []);

    const chips = describeFilters(filters, facets);
    const activeCount = countActiveFilters(filters);

    return (
        <div ref={scrollRef} className={style.screen}>
            <div
                className={`${style.header} ${isHeaderHidden ? style.headerHidden : ''}`}
                style={{paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`}}
            >
                <div className={style.headerRow}>
                    {hasNativeBack ? null : <BackPill className={style.back} onClick={back}/>}

                    <div className={style.headerText}>
                        <h1 className={style.title}>{title}</h1>
                        <span className={style.count}>
                            {isMissing
                                ? 'Раздел недоступен'
                                : items === null
                                    ? 'Загружаем…'
                                    : `${total.toLocaleString('ru-RU')} ${productsPlural(total)}`}
                        </span>
                    </div>
                </div>

                <div className={style.controls}>
                    <button
                        type="button"
                        className={`${style.chip} ${activeCount > 0 ? style.chipActive : ''}`}
                        onClick={openSheet}
                    >
                        <FunnelIcon className={style.chipIcon}/>
                        {activeCount > 0 ? `Фильтры · ${activeCount}` : 'Фильтры'}
                    </button>

                    <button type="button" className={style.chip} onClick={openSheet}>
                        <SortIcon className={style.chipIcon}/>
                        {sortingLabel(sorting)}
                    </button>

                    {chips.map((chip) => (
                        <button
                            key={chip.id}
                            type="button"
                            className={`${style.chip} ${style.chipRemovable}`}
                            onClick={() => setFilters((current) => chip.remove(current))}
                        >
                            {chip.label}
                            <span className={style.chipCross} aria-hidden="true">✕</span>
                        </button>
                    ))}
                </div>
            </div>

            <div
                className={style.content}
                style={{paddingBottom: `calc(${safeAreaInset.bottom}px + 24 * var(--u))`}}
            >
                {isMissing ? (
                    <EmptyState
                        icon="🗂"
                        title="Каталог не найден"
                        text="Похоже, раздел переехал или его убрали с витрины."
                        actionLabel="На главную"
                        onAction={() => navigate('/main')}
                    />
                ) : items === null && !error ? (
                    <ProductGridSkeleton/>
                ) : error && items === null ? (
                    <EmptyState
                        tone="danger"
                        icon="⚠"
                        title="Каталог не загрузился"
                        text="Проверьте связь и попробуйте ещё раз — товары никуда не делись."
                        actionLabel="Повторить"
                        onAction={retry}
                    />
                ) : items.length === 0 ? (
                    <div className={style.empty}>
                        <span className={style.emptyIcon} aria-hidden="true">
                            <span className={style.emptySlider}><i style={{left: '20%'}}/></span>
                            <span className={style.emptySlider}><i style={{left: '62%'}}/></span>
                            <span className={style.emptySlider}><i style={{left: '38%'}}/></span>
                        </span>

                        <div className={style.emptyText}>
                            <span className={style.emptyTitle}>
                                {activeCount > 0 ? 'Под такие фильтры ничего нет' : 'В каталоге пока пусто'}
                            </span>
                            <span className={style.emptyNote}>
                                {activeCount > 0
                                    ? 'Попробуйте убрать цену или платформу — обычно это открывает десятки позиций'
                                    : 'Товары появятся, как только каталог наполнится. Загляните позже.'}
                            </span>
                        </div>

                        {activeCount > 0 ? (
                            <div className={style.emptyActions}>
                                <button type="button" className={style.emptyPrimary} onClick={resetFilters}>
                                    Сбросить фильтры
                                </button>
                                <button type="button" className={style.emptySecondary} onClick={openSheet}>
                                    Изменить фильтры
                                </button>
                            </div>
                        ) : null}

                        {similar.length ? (
                            <div className={style.similar}>
                                <span className={style.similarTitle}>Похожее</span>
                                <div className={style.similarRow}>
                                    {similar.map((product) => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            className={style.similarCard}
                                            onClick={() => openProduct(product)}
                                        >
                                            <span
                                                className={style.similarCover}
                                                style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                                            />
                                            <span className={style.similarName}>{product.name}</span>
                                            <span className={style.similarPrice}>
                                                {Number(product.price).toLocaleString('ru-RU')} ₽
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <>
                        <ProductGrid items={items} animate={!isRestored} onOpen={openProduct}/>

                        {hasMore ? (
                            <div ref={sentinelRef} className={style.more}>
                                <ProductGridSkeleton count={2}/>
                            </div>
                        ) : null}

                        {error ? (
                            <button type="button" className={style.retry} onClick={retry}>
                                Не удалось догрузить. Повторить
                            </button>
                        ) : null}
                    </>
                )}
            </div>

            {isSheetOpen ? (
                <FilterSheet
                    scope={scope}
                    facets={facets}
                    price={price}
                    filters={filters}
                    sorting={sorting}
                    total={total}
                    onApply={applyFilters}
                    onClose={() => setSheetOpen(false)}
                />
            ) : null}
        </div>
    );
}
