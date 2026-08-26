import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {useBackButton} from '../../shared/hooks/useBackButton';
import {useHidingHeader} from '../../shared/hooks/useHidingHeader';
import {useNearBottom} from '../../shared/hooks/useNearBottom';
import {useScrollMemory} from '../../shared/hooks/useScrollMemory';
import {hapticImpact} from '../../shared/lib/haptic';
import {claimKeyboard} from '../../shared/lib/keyboard';
import {regionIcon, regionTitle} from '../../shared/lib/region';
import {readSearchForm, writeSearchForm} from '../../shared/lib/searchMemory';
import {getTelegramObject} from '../../shared/lib/telegram';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import {supportUrlForBot} from '../More/moreMenu';
import {loadFacets, peekFacets} from '../../shared/api/facetsCache';
import {
    countActiveFilters,
    createFilters,
    describeFilters,
    productsPlural,
    sortingLabel
} from '../../shared/lib/catalogQuery';
import {
    AddonsIcon,
    DonationIcon,
    FunnelIcon,
    GamesIcon,
    SortIcon,
    SubscriptionIcon
} from '../Catalog/CatalogIcons';
import ProductGrid, {ProductGridSkeleton} from '../Catalog/ProductGrid';
import FilterSheet from '../Catalog/FilterSheet';
import {useCatalogProducts} from '../Catalog/useCatalogProducts';
import {buildCategories, buildGenres} from './searchSections';
import {clearRecentSearches, forgetSearch, loadRecentSearches, rememberSearch} from './recentSearches';
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
    const {contentSafeAreaInset, safeAreaInset, isKeyboardOpen} = useAppInsets();

    const pageId = useSessionStore((state) => state.pageId);
    const botType = useSessionStore((state) => state.botType);
    const pages = useStructureStore((state) => state.pages);
    const startPages = useStructureStore((state) => state.startPages);

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
    const [{facets, price}, setFacetData] = useState(() => peekFacets({pageId}));
    const [recent, setRecent] = useState(() => loadRecentSearches());
    const [isFieldFocused, setFieldFocused] = useState(false);

    const scope = useMemo(() => ({pageId}), [pageId]);
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

    const isVeiled = isFieldFocused && !isSheetOpen;
    const isIdleVeiled = isVeiled && mode === 'idle';

    const holdFocus = useCallback((event) => event.preventDefault(), []);

    const dismissFocus = useCallback(() => {
        inputRef.current?.blur();
        setFieldFocused(false);
    }, []);

    useEffect(() => {
        let isAlive = true;

        loadFacets({pageId})
            .then((value) => {
                if (isAlive) setFacetData(value);
            })
            .catch(() => undefined);

        return () => {
            isAlive = false;
        };
    }, [pageId]);

    const search = useSearchResults({query: trimmed, scope, filters, sorting});

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
        if (trimmed.length >= MIN_QUERY_LENGTH) setRecent(rememberSearch(trimmed));
        navigate(`/card/${product.id}`);
    }, [navigate, trimmed]);

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

    useBackButton(reset, {enabled: mode !== 'idle'});

    const askManager = useCallback(() => {
        const url = supportUrlForBot(botType);
        if (!url) return;

        hapticImpact('light');

        const tg = getTelegramObject();
        if (typeof tg.openLink === 'function') tg.openLink(url);
        else window.open(url, '_blank', 'noopener');
    }, [botType]);

    const chips = describeFilters(filters, facets);

    const categories = useMemo(() => buildCategories(facets), [facets]);
    const genres = useMemo(() => buildGenres(facets), [facets]);

    return (
        <div ref={scrollRef} className={style.screen}>
            <div
                className={`${style.header} ${isHeaderHidden ? style.headerHidden : ''}`}
                style={{paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`}}
            >
                <div className={style.headerRow}>
                    <h1 className={style.title}>Поиск</h1>

                    {region ? (
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

            {isVeiled ? (
                <button
                    type="button"
                    className={`${style.veil} ${isIdleVeiled ? style.veilDimmed : ''}`}
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
                        onOpen={openProduct}
                        onReset={reset}
                        onAskManager={askManager}
                        onOpenCatalog={() => navigate('/main')}
                    />
                ) : mode === 'browse' ? (
                    <BrowseOutcome
                        state={browse}
                        onOpen={openProduct}
                        onReset={reset}
                        sentinelRef={sentinelRef}
                    />
                ) : (
                    <IdleScreen
                        categories={categories}
                        genres={genres}
                        recent={recent}
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

function SearchOutcome({state, query, onOpen, onReset, onAskManager, onOpenCatalog}) {
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
                <ProductGrid items={state.items} animate={!state.isRestored} onOpen={onOpen}/>
            </>
        );
    }

    return (
        <div className={style.empty}>
            <span className={style.emptyIcon} aria-hidden="true">🔍</span>

            <div className={style.emptyText}>
                <span className={style.emptyTitle}>Ничего не нашли</span>
                <span className={style.emptyNote}>
                    Проверьте написание или поищите на английском — часть игр в каталоге
                    под оригинальными названиями
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

function BrowseOutcome({state, onOpen, onReset, sentinelRef}) {
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

            <ProductGrid items={state.items} animate={!state.isRestored} onOpen={onOpen}/>

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

                    <div className={style.recent}>
                        {recent.map((value) => (
                            <div key={value} className={style.recentRow}>
                                <button
                                    type="button"
                                    className={style.recentPick}
                                    onClick={() => onPickRecent(value)}
                                >
                                    <span className={style.recentIcon} aria-hidden="true">↺</span>
                                    <span className={style.recentValue}>{value}</span>
                                </button>

                                <button
                                    type="button"
                                    className={style.recentRemove}
                                    aria-label={`Убрать «${value}» из истории`}
                                    onClick={() => onForgetRecent(value)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}
        </div>
    );
}
