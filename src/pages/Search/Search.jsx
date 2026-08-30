import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {useBackButton} from '../../shared/hooks/useBackButton';
import {useHidingHeader} from '../../shared/hooks/useHidingHeader';
import {useNearBottom} from '../../shared/hooks/useNearBottom';
import {useScrollMemory} from '../../shared/hooks/useScrollMemory';
import {hapticImpact} from '../../shared/lib/haptic';
import {claimKeyboard} from '../../shared/lib/keyboard';
import {regionIcon, regionLabel, regionTitle} from '../../shared/lib/region';
import {readSearchForm, writeSearchForm} from '../../shared/lib/searchMemory';
import {getTelegramObject} from '../../shared/lib/telegram';
import BackPill from '../../shared/ui/BackPill/BackPill';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import {supportUrlForBot} from '../More/moreMenu';
import {loadFacets, peekFacets} from '../../shared/api/facetsCache';
import {
    countActiveFilters,
    createFilters,
    describeFilters,
    matchQueryTags,
    productsPlural,
    sortingLabel
} from '../../shared/lib/catalogQuery';
import {
    AddonsIcon,
    DonationIcon,
    FunnelIcon,
    GamesIcon,
    PlatformIcon,
    SortIcon,
    SubscriptionIcon,
    TypeIcon
} from '../Catalog/CatalogIcons';
import ProductGrid, {ProductGridSkeleton} from '../Catalog/ProductGrid';
import FilterSheet from '../Catalog/FilterSheet';
import {useCatalogProducts} from '../Catalog/useCatalogProducts';
import {buildCategories, buildGenres} from './searchSections';
import {clearRecentSearches, forgetSearch, loadRecentSearches, rememberSearch} from './recentSearches';
import {dedupeProducts} from './dedupeProducts';
import {useSearchResults, MIN_QUERY_LENGTH} from './useSearchResults';
import style from './Search.module.scss';

const TILE_ICONS = {
    games: GamesIcon,
    subscriptions: SubscriptionIcon,
    donation: DonationIcon,
    addons: AddonsIcon
};

export default function Search() {
    const navigate = useNavigate();
    const location = useLocation();
    const {contentSafeAreaInset, safeAreaInset, isKeyboardOpen} = useAppInsets();

    const pageId = useSessionStore((state) => state.pageId);
    const setPageId = useSessionStore((state) => state.setPageId);
    const botType = useSessionStore((state) => state.botType);
    const pages = useStructureStore((state) => state.pages);
    const startPages = useStructureStore((state) => state.startPages);
    const catalogs = useStructureStore((state) => state.catalogs);

    const allPages = Boolean(location.state?.allPages);

    const region = useMemo(() => {
        const page = (pages || []).find((candidate) => candidate.id === pageId);
        const startPage = (startPages || []).find((candidate) => candidate.structurePageId === pageId);

        if (!page && !startPage) return null;

        return {title: regionTitle(page, startPage), icon: regionIcon(page, startPage)};
    }, [pages, startPages, pageId]);

    const saved = useRef(readSearchForm()).current;

    const [query, setQuery] = useState(saved?.query || '');
    const [filters, setFilters] = useState(() => saved?.filters || createFilters());
    const [sorting, setSorting] = useState(saved?.sorting || 'default');
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [isFieldFocused, setFieldFocused] = useState(false);

    const scope = useMemo(
        () => (allPages ? {allPages: true, botType} : {pageId}),
        [allPages, botType, pageId]
    );

    const [{facets, price}, setFacetData] = useState(() => peekFacets(scope));
    const [recent, setRecent] = useState(() => loadRecentSearches());

    const catalogById = useMemo(
        () => new Map((catalogs || []).map((catalog) => [catalog.id, catalog])),
        [catalogs]
    );

    const pageIdOfProduct = useCallback(
        (product) => catalogById.get(product.catalogId)?.structurePageId ?? null,
        [catalogById]
    );

    const regionOfProduct = useMemo(() => {
        if (!allPages) return null;

        const pageById = new Map((pages || []).map((candidate) => [candidate.id, candidate]));
        const startPageByPageId = new Map((startPages || []).map((item) => [item.structurePageId, item]));

        return (product) => {
            const productPageId = pageIdOfProduct(product);
            if (productPageId === null) return null;

            const productPage = pageById.get(productPageId) || null;
            const productStartPage = startPageByPageId.get(productPageId) || null;
            if (!productPage && !productStartPage) return null;

            return {
                title: regionLabel(productPage, productStartPage),
                icon: regionIcon(productPage, productStartPage),
                color: productStartPage?.color || null
            };
        };
    }, [allPages, pages, startPages, pageIdOfProduct]);

    const inputRef = useRef(null);

    useEffect(() => {
        claimKeyboard(inputRef.current);
    }, []);

    useEffect(() => {
        writeSearchForm({query, filters, sorting});
    }, [query, filters, sorting]);

    const trimmed = query.trim();
    const isSearching = trimmed.length >= MIN_QUERY_LENGTH;
    const activeCount = countActiveFilters(filters);
    const isBrowsing = !isSearching && activeCount > 0;
    const mode = isSearching ? 'results' : isBrowsing ? 'browse' : 'idle';

    const scrollRef = useScrollMemory(`search:${mode}`);
    const isHeaderHidden = useHidingHeader(scrollRef, {enabled: !isSheetOpen && !isKeyboardOpen});

    const isIdleVeiled = isFieldFocused && !isSheetOpen && mode === 'idle';

    const holdFocus = useCallback((event) => event.preventDefault(), []);

    const dismissFocus = useCallback(() => {
        inputRef.current?.blur();
        setFieldFocused(false);
    }, []);

    useEffect(() => {
        let isAlive = true;

        loadFacets(scope)
            .then((value) => {
                if (isAlive) setFacetData(value);
            })
            .catch(() => undefined);

        return () => {
            isAlive = false;
        };
    }, [scope]);

    const rawSearch = useSearchResults({query: trimmed, scope, filters, sorting});

    const search = useMemo(() => ({
        ...rawSearch,
        items: dedupeProducts(rawSearch.items, pageIdOfProduct),
        suggestions: dedupeProducts(rawSearch.suggestions, pageIdOfProduct)
    }), [rawSearch, pageIdOfProduct]);

    const browseQuery = useMemo(
        () => ({...scope, filters: isBrowsing ? filters : createFilters(), sorting}),
        [scope, filters, sorting, isBrowsing]
    );

    const browse = useCatalogProducts(browseQuery, {enabled: isBrowsing});

    const sentinelRef = useNearBottom({
        rootRef: scrollRef,
        enabled: isBrowsing && browse.hasMore && !browse.isLoading && !browse.error,
        onReach: browse.loadMore
    });

    useEffect(() => {
        if (!isSearching || search.isLoading || search.error) return;
        if (!search.items || search.items.length === 0) return;

        setRecent(rememberSearch(trimmed));
    }, [isSearching, search.isLoading, search.error, search.items, trimmed]);

    const openProduct = useCallback((product) => {
        hapticImpact('light');
        inputRef.current?.blur();
        if (trimmed.length >= MIN_QUERY_LENGTH) setRecent(rememberSearch(trimmed));

        const productPageId = pageIdOfProduct(product);
        if (productPageId !== null && (allPages || pageId === null) && productPageId !== pageId) {
            setPageId(productPageId);
        }

        navigate(`/card/${product.id}`);
    }, [allPages, navigate, trimmed, pageId, pageIdOfProduct, setPageId]);

    const submit = useCallback((event) => {
        event.preventDefault();
        event.target.querySelector('input')?.blur();
        if (trimmed.length >= MIN_QUERY_LENGTH) setRecent(rememberSearch(trimmed));
    }, [trimmed]);

    const applySection = useCallback((nextFilters, nextSorting = 'default') => {
        hapticImpact('light');
        setQuery('');
        setFilters(nextFilters);
        setSorting(nextSorting);
    }, []);

    const applyFilters = useCallback((nextFilters, nextSorting) => {
        setFilters(nextFilters);
        setSorting(nextSorting);
        scrollRef.current?.scrollTo({top: 0, behavior: 'instant'});
    }, [scrollRef]);

    const reset = useCallback(() => {
        hapticImpact('light');
        setQuery('');
        setFilters(createFilters());
        setSorting('default');
    }, []);

    const exitGlobalSearch = useCallback(() => {
        hapticImpact('light');
        navigate('/');
    }, [navigate]);

    const goBack = useCallback(() => {
        if (mode !== 'idle') {
            reset();
            return;
        }
        exitGlobalSearch();
    }, [mode, reset, exitGlobalSearch]);

    const hasNativeBack = useBackButton(goBack, {enabled: mode !== 'idle' || allPages});

    const askManager = useCallback(() => {
        const url = supportUrlForBot(botType);
        if (!url) return;

        hapticImpact('light');

        const tg = getTelegramObject();
        if (typeof tg.openLink === 'function') tg.openLink(url);
        else window.open(url, '_blank', 'noopener');
    }, [botType]);

    const chips = describeFilters(filters, facets);

    const queryTags = useMemo(() => matchQueryTags(trimmed, facets), [trimmed, facets]);

    const categories = useMemo(() => buildCategories(facets), [facets]);
    const genres = useMemo(() => buildGenres(facets), [facets]);

    return (
        <div ref={scrollRef} className={style.screen}>
            <div
                className={`${style.header} ${isHeaderHidden ? style.headerHidden : ''}`}
                style={{paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`}}
            >
                <div className={style.headerRow}>
                    {allPages && !hasNativeBack ? (
                        <BackPill className={style.back} onClick={exitGlobalSearch}/>
                    ) : null}

                    <h1 className={style.title}>Поиск</h1>

                    {allPages ? (
                        <span className={style.region}>Глобальный поиск</span>
                    ) : region ? (
                        <span className={style.region}>
                            {region.icon ? (
                                <span
                                    className={style.regionIcon}
                                    style={{backgroundImage: `url(${region.icon})`}}
                                    aria-hidden="true"
                                />
                            ) : null}
                            {region.title}
                        </span>
                    ) : null}
                </div>

                <form className={`${style.field} ${isSearching ? style.fieldActive : ''}`} onSubmit={submit}>
                    <svg className={style.fieldIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="10.6" cy="10.6" r="6.7" stroke="currentColor" strokeWidth="1.9"/>
                        <path d="m15.6 15.6 5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
                    </svg>

                    <input
                        ref={inputRef}
                        className={style.input}
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onFocus={() => setFieldFocused(true)}
                        onBlur={() => setFieldFocused(false)}
                        placeholder="Введите название игры или подписки"
                        autoComplete="off"
                        enterKeyHint="search"
                    />

                    {query ? (
                        <button type="button" className={style.clear} aria-label="Очистить" onClick={() => setQuery('')}>
                            ✕
                        </button>
                    ) : null}
                </form>

                {queryTags.length ? (
                    <div className={style.tags}>
                        {queryTags.map((tag) => {
                            const TagIcon = tag.key === 'platform' ? PlatformIcon : TypeIcon;

                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    className={style.tag}
                                    onPointerDown={holdFocus}
                                    onClick={() => applySection(tag.filters)}
                                >
                                    <TagIcon className={style.tagIcon}/>
                                    <span className={style.tagLabel}>Все: {tag.label}</span>
                                    {tag.count ? (
                                        <span className={style.tagCount}>
                                            {tag.count.toLocaleString('ru-RU')}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                ) : null}

                <div className={`${style.recentReveal} ${isIdleVeiled && recent.length ? style.recentRevealOpen : ''}`}>
                    <div className={style.recentRevealInner}>
                        <div className={style.sectionHead}>
                            <span className={style.sectionTitle}>Недавние запросы</span>
                            <button
                                type="button"
                                className={style.sectionAction}
                                tabIndex={isIdleVeiled ? undefined : -1}
                                onPointerDown={holdFocus}
                                onClick={() => setRecent(clearRecentSearches())}
                            >
                                Очистить
                            </button>
                        </div>

                        <RecentList
                            recent={recent}
                            holdFocus={holdFocus}
                            tabIndex={isIdleVeiled ? undefined : -1}
                            onPick={(value) => setQuery(value)}
                            onForget={(value) => setRecent(forgetSearch(value))}
                        />
                    </div>
                </div>

                {mode !== 'idle' ? (
                    <div className={style.controls}>
                        <button
                            type="button"
                            className={`${style.chip} ${activeCount > 0 ? style.chipActive : ''}`}
                            onClick={() => {
                                hapticImpact('light');
                                setSheetOpen(true);
                            }}
                        >
                            <FunnelIcon className={style.chipIcon}/>
                            {activeCount > 0 ? `Фильтры · ${activeCount}` : 'Фильтры'}
                        </button>

                        <button type="button" className={style.chip} onClick={() => setSheetOpen(true)}>
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
                ) : null}
            </div>

            {isIdleVeiled ? (
                <button
                    type="button"
                    className={`${style.veil} ${style.veilDimmed}`}
                    aria-label="Свернуть клавиатуру"
                    onPointerDown={holdFocus}
                    onClick={dismissFocus}
                />
            ) : null}

            <div
                key={mode}
                className={`${style.content} ${isIdleVeiled ? style.contentBlurred : ''}`}
                style={{paddingBottom: `calc(${safeAreaInset.bottom}px + 24 * var(--u))`}}
            >
                {mode === 'results' ? (
                    <SearchOutcome
                        state={search}
                        query={trimmed}
                        regionOf={regionOfProduct}
                        onOpen={openProduct}
                        onReset={reset}
                        onAskManager={askManager}
                        onOpenCatalog={() => navigate('/main')}
                    />
                ) : mode === 'browse' ? (
                    <BrowseOutcome
                        state={browse}
                        regionOf={regionOfProduct}
                        onOpen={openProduct}
                        onReset={reset}
                        sentinelRef={sentinelRef}
                    />
                ) : (
                    <IdleScreen
                        categories={categories}
                        genres={genres}
                        recent={isIdleVeiled ? [] : recent}
                        onApply={applySection}
                        onPickRecent={(value) => setQuery(value)}
                        onForgetRecent={(value) => setRecent(forgetSearch(value))}
                        onClearRecent={() => setRecent(clearRecentSearches())}
                    />
                )}
            </div>

            {isSheetOpen ? (
                <FilterSheet
                    scope={scope}
                    facets={facets}
                    price={price}
                    filters={filters}
                    sorting={sorting}
                    total={isBrowsing ? browse.total : null}
                    onApply={applyFilters}
                    onClose={() => setSheetOpen(false)}
                />
            ) : null}
        </div>
    );
}

function SearchOutcome({state, query, regionOf, onOpen, onReset, onAskManager, onOpenCatalog}) {
    if (state.isLoading || state.items === null) {
        return state.error ? (
            <EmptyState
                tone="danger"
                icon="⚠"
                title="Поиск не отвечает"
                text="Проверьте связь и попробуйте ещё раз."
                actionLabel="Сбросить"
                onAction={onReset}
            />
        ) : (
            <ProductGridSkeleton/>
        );
    }

    if (state.items.length > 0) {
        return (
            <>
                <span className={style.found}>
                    Найдено {state.items.length.toLocaleString('ru-RU')} {productsPlural(state.items.length)}
                </span>
                <ProductGrid items={state.items} animate={!state.isRestored} regionOf={regionOf} onOpen={onOpen}/>
            </>
        );
    }

    return (
        <div className={style.empty}>
            <span className={style.emptyIcon} aria-hidden="true">🔍</span>

            <div className={style.emptyText}>
                <span className={style.emptyTitle}>Ничего не нашли</span>
                <span className={style.emptyNote}>
                    Проверьте написание — все игры в каталоге под оригинальными названиями
                </span>
            </div>

            <div className={style.emptyActions}>
                <button type="button" className={style.emptyPrimary} onClick={onAskManager}>
                    Попросить менеджера найти
                </button>
                <button type="button" className={style.emptySecondary} onClick={onOpenCatalog}>
                    Открыть каталог
                </button>
            </div>

            {state.suggestions.length ? (
                <div className={style.suggestions}>
                    <span className={style.suggestionsTitle}>Возможно, вы искали</span>

                    {state.suggestions.map((product) => (
                        <button
                            key={product.id}
                            type="button"
                            className={style.suggestion}
                            onClick={() => onOpen(product)}
                        >
                            <span
                                className={style.suggestionCover}
                                style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                            />

                            <span className={style.suggestionBody}>
                                <span className={style.suggestionName}>{product.name}</span>
                                <span className={style.suggestionMeta}>
                                    {[product.platform, product.typeLabel].filter(Boolean).join(' · ')}
                                </span>
                            </span>

                            <span className={style.suggestionPrice}>
                                {Number(product.price).toLocaleString('ru-RU')} ₽
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <span className={style.emptyQuery}>По запросу «{query}» ничего похожего тоже нет</span>
            )}
        </div>
    );
}

function BrowseOutcome({state, regionOf, onOpen, onReset, sentinelRef}) {
    if (state.items === null) {
        return state.error ? (
            <EmptyState
                tone="danger"
                icon="⚠"
                title="Подборка не загрузилась"
                text="Проверьте связь и попробуйте ещё раз."
                actionLabel="Повторить"
                onAction={state.retry}
            />
        ) : (
            <ProductGridSkeleton/>
        );
    }

    if (state.items.length === 0) {
        return (
            <EmptyState
                icon="🗂"
                title="Под такие фильтры ничего нет"
                text="Попробуйте убрать цену или платформу — обычно это открывает десятки позиций."
                actionLabel="Сбросить фильтры"
                onAction={onReset}
            />
        );
    }

    return (
        <>
            <span className={style.found}>
                {state.total.toLocaleString('ru-RU')} {productsPlural(state.total)}
            </span>

            <ProductGrid items={state.items} animate={!state.isRestored} regionOf={regionOf} onOpen={onOpen}/>

            {state.hasMore ? (
                <div ref={sentinelRef} className={style.more}>
                    <ProductGridSkeleton count={2}/>
                </div>
            ) : null}
        </>
    );
}

function IdleScreen({categories, genres, recent, onApply, onPickRecent, onForgetRecent, onClearRecent}) {
    return (
        <div className={style.idle}>
            {categories.length ? (
                <section className={style.section}>
                    <span className={style.sectionTitle}>Категории</span>

                    <div className={style.tiles}>
                        {categories.map((tile) => {
                            const TileIcon = TILE_ICONS[tile.icon];

                            return (
                                <button
                                    key={tile.type}
                                    type="button"
                                    className={`${style.tile} ${style[tile.tone]}`}
                                    onClick={() => onApply(tile.filters)}
                                >
                                    {TileIcon ? (
                                        <span className={style.tileIcon} aria-hidden="true">
                                            <TileIcon/>
                                        </span>
                                    ) : null}

                                    <span className={style.tileTitle}>{tile.title}</span>
                                    <span className={style.tileNote}>{tile.note}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            ) : null}

            {genres.length ? (
                <section className={style.section}>
                    <span className={style.sectionTitle}>Жанры</span>

                    <div className={style.genres}>
                        {genres.map((genre) => (
                            <button
                                key={genre.value}
                                type="button"
                                className={style.genre}
                                onClick={() => onApply(genre.filters)}
                            >
                                {genre.label}
                            </button>
                        ))}
                    </div>
                </section>
            ) : null}

            {recent.length ? (
                <section className={style.section}>
                    <div className={style.sectionHead}>
                        <span className={style.sectionTitle}>Недавние запросы</span>
                        <button type="button" className={style.sectionAction} onClick={onClearRecent}>
                            Очистить
                        </button>
                    </div>

                    <RecentList recent={recent} onPick={onPickRecent} onForget={onForgetRecent}/>
                </section>
            ) : null}
        </div>
    );
}

function RecentList({recent, holdFocus, tabIndex, onPick, onForget}) {
    return (
        <div className={style.recent}>
            {recent.map((value) => (
                <div key={value} className={style.recentRow}>
                    <button
                        type="button"
                        className={style.recentPick}
                        tabIndex={tabIndex}
                        onPointerDown={holdFocus}
                        onClick={() => onPick(value)}
                    >
                        <span className={style.recentIcon} aria-hidden="true">↺</span>
                        <span className={style.recentValue}>{value}</span>
                    </button>

                    <button
                        type="button"
                        className={style.recentRemove}
                        aria-label={`Убрать «${value}» из истории`}
                        tabIndex={tabIndex}
                        onPointerDown={holdFocus}
                        onClick={() => onForget(value)}
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}
