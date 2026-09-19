import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useStructureStore} from '../../../store/useStructureStore';
import {usePlatform} from '../../../shared/hooks/usePlatform';
import {loadFacets, peekFacets} from '../../../shared/api/facetsCache';
import {createProductOrigin} from '../../../shared/lib/productOrigin';
import {
    SORTINGS,
    countActiveFilters,
    createFilters,
    describeFilters,
    productsPlural
} from '../../../shared/lib/catalogQuery';
import EmptyState from '../../../shared/ui/EmptyState/EmptyState';
import {useCatalogProducts} from '../../../pages/Catalog/useCatalogProducts';
import {useSearchResults, MIN_QUERY_LENGTH} from '../../../pages/Search/useSearchResults';
import {buildCategories, buildGenres} from '../../../pages/Search/searchSections';
import {clearRecentSearches, forgetSearch, loadRecentSearches, rememberSearch} from '../../../pages/Search/recentSearches';
import {resolveBotType, storefrontList} from '../../model/desktopNav';
import SelectMenu from '../../ui/SelectMenu';
import {mergeOffers} from '../../model/storefrontModel';
import {useNearBottom} from '../../../shared/hooks/useNearBottom';
import {scopeFilter} from '../../model/storefrontTotals';
import {useStorefrontScope} from '../../shell/StorefrontScope';
import {useScrollArea, useScrollMemory} from '../../shell/ScrollAreaContext';
import {useOfferPicker} from '../../shell/useOfferPicker';
import {Reveal} from '../../shell/useReveal';
import Spinner from '../../ui/Spinner';
import FilterPanel from '../Catalog/FilterPanel';
import OfferCard from '../Storefront/OfferCard';
import OfferSplit from '../Storefront/OfferSplit';
import {SearchIcon} from '../../shell/DesktopIcons';
import BackLink from '../../ui/BackLink';
import style from './DesktopSearch.module.scss';

const SKELETON_COUNT = 10;

export default function DesktopSearch() {
    const navigate = useNavigate();
    const location = useLocation();
    const {botType} = usePlatform();

    const pages = useStructureStore((store) => store.pages);
    const startPages = useStructureStore((store) => store.startPages);
    const catalogs = useStructureStore((store) => store.catalogs);

    const seed = typeof location.state?.query === 'string' ? location.state.query : '';

    const [query, setQuery] = useState(seed);
    const [filters, setFilters] = useState(createFilters);
    const [sorting, setSorting] = useState('default');
    const [recent, setRecent] = useState(() => loadRecentSearches());

    const inputRef = useRef(null);

    const effectiveBotType = useMemo(
        () => resolveBotType(startPages, botType),
        [startPages, botType]
    );

    const {scopeId} = useStorefrontScope();

    const scope = useMemo(
        () => scopeFilter(scopeId, effectiveBotType),
        [scopeId, effectiveBotType]
    );

    const [{facets, price}, setFacetData] = useState(() => peekFacets(scope));

    useEffect(() => {
        setQuery(seed);
    }, [seed, location.state?.stamp]);

    useEffect(() => {
        inputRef.current?.focus();
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

    const originOf = useMemo(
        () => createProductOrigin({catalogs, pages, startPages}),
        [catalogs, pages, startPages]
    );

    const scopeName = useMemo(() => (scopeId === null
        ? null
        : storefrontList(startPages, pages, botType).find((item) => item.id === scopeId)?.label || null),
    [scopeId, startPages, pages, botType]);

    const trimmed = query.trim();
    const isSearching = trimmed.length >= MIN_QUERY_LENGTH;
    const activeCount = countActiveFilters(filters);
    const isBrowsing = !isSearching && activeCount > 0;
    const mode = isSearching ? 'results' : isBrowsing ? 'browse' : 'idle';

    const search = useSearchResults({query: trimmed, scope, filters, sorting});

    const browseQuery = useMemo(
        () => ({...scope, filters: isBrowsing ? filters : createFilters(), sorting}),
        [scope, filters, sorting, isBrowsing]
    );

    const browse = useCatalogProducts(browseQuery, {enabled: isBrowsing});

    useEffect(() => {
        if (!isSearching || search.isLoading || search.error) return;
        if (!search.items || search.items.length === 0) return;

        setRecent(rememberSearch(trimmed));
    }, [isSearching, search.isLoading, search.error, search.items, trimmed]);

    const searchOffers = useMemo(
        () => (search.items === null ? null : mergeOffers(search.items, originOf)),
        [search.items, originOf]
    );

    const browseOffers = useMemo(
        () => (browse.items === null ? null : mergeOffers(browse.items, originOf)),
        [browse.items, originOf]
    );

    const picker = useOfferPicker({originOf});
    const openOffer = picker.open;

    const applySection = useCallback((nextFilters, nextSorting = 'default') => {
        setQuery('');
        setFilters(nextFilters);
        setSorting(nextSorting);
    }, []);

    const reset = useCallback(() => {
        setQuery('');
        setFilters(createFilters());
        setSorting('default');
        inputRef.current?.focus();
    }, []);

    const areaRef = useScrollArea();

    const formStamp = JSON.stringify({filters, sorting, scopeId});
    const formStampRef = useRef(formStamp);

    useEffect(() => {
        if (formStampRef.current === formStamp) return;

        formStampRef.current = formStamp;
        areaRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
    }, [formStamp, areaRef]);

    const sentinelRef = useNearBottom({
        rootRef: areaRef,
        enabled: mode === 'browse' && browse.hasMore && !browse.isLoading && !browse.error,
        onReach: browse.loadMore
    });

    useScrollMemory(`search:${mode}`, {ready: mode === 'idle' || searchOffers !== null || browseOffers !== null});

    const chips = describeFilters(filters, facets);
    const categories = useMemo(() => buildCategories(facets), [facets]);
    const genres = useMemo(() => buildGenres(facets), [facets]);

    const offers = mode === 'results' ? searchOffers : mode === 'browse' ? browseOffers : null;
    const isLoading = mode === 'results' ? search.isLoading : browse.isLoading;
    const total = mode === 'browse' ? browse.total : offers?.length ?? 0;

    return (
        <div className={style.screen}>
            <BackLink to="/" label="Назад"/>

            <OfferSplit offer={picker.picked} onPick={picker.pick} onClose={picker.close}/>

            <header className={style.head}>
                <h1 className={style.title}>
                    {scopeName ? `Поиск по витрине ${scopeName}` : 'Поиск по всем витринам'}
                </h1>

                <form className={style.field} onSubmit={(event) => event.preventDefault()} role="search">
                    <SearchIcon className={style.fieldIcon}/>

                    <input
                        ref={inputRef}
                        className={style.input}
                        type="text"
                        value={query}
                        autoComplete="off"
                        placeholder="Название игры, подписки или доната"
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Escape' && query) {
                                event.preventDefault();
                                setQuery('');
                            }
                        }}
                        aria-label={scopeName ? `Поиск по витрине ${scopeName}` : 'Поиск по всем витринам'}
                    />

                    {isLoading && isSearching ? <Spinner className={style.fieldSpinner}/> : null}

                    {query ? (
                        <button
                            type="button"
                            className={style.clear}
                            onClick={() => {
                                setQuery('');
                                inputRef.current?.focus();
                            }}
                            aria-label="Очистить"
                        >
                            ✕
                        </button>
                    ) : null}
                </form>
            </header>

            <div className={style.body}>
                <FilterPanel filters={filters} facets={facets} price={price} onChange={setFilters}/>

                <div className={style.content}>
                    <div className={style.bar}>
                        <span className={style.count}>
                            {mode === 'idle'
                                ? (scopeName
                                    ? `Начните вводить название — ищем в витрине ${scopeName}`
                                    : 'Начните вводить название — поиск идёт по всем витринам сразу')
                                : offers === null
                                    ? 'Ищем…'
                                    : `${total.toLocaleString('ru-RU')} ${productsPlural(total)}`}
                        </span>

                        {mode !== 'idle' ? (
                            <div className={style.sort}>
                                <span className={style.sortLabel}>Сортировка</span>
                                <SelectMenu
                                    options={SORTINGS}
                                    value={sorting}
                                    onChange={setSorting}
                                    label="Сортировка"
                                />
                            </div>
                        ) : null}
                    </div>

                    {chips.length ? (
                        <div className={style.chips}>
                            {chips.map((chip) => (
                                <button
                                    key={chip.id}
                                    type="button"
                                    className={style.chip}
                                    onClick={() => setFilters(chip.remove(filters))}
                                >
                                    {chip.label}
                                    <span className={style.chipCross} aria-hidden="true">✕</span>
                                </button>
                            ))}
                        </div>
                    ) : null}

                    {mode === 'idle' ? (
                        <IdleBoard
                            categories={categories}
                            genres={genres}
                            recent={recent}
                            onApply={applySection}
                            onPickRecent={(value) => {
                                setQuery(value);
                                inputRef.current?.focus();
                            }}
                            onForgetRecent={(value) => setRecent(forgetSearch(value))}
                            onClearRecent={() => setRecent(clearRecentSearches())}
                        />
                    ) : null}

                    {mode !== 'idle' && offers === null ? (
                        <div className={style.grid}>
                            {Array.from({length: SKELETON_COUNT}, (row, index) => (
                                <div key={index} className={style.skeleton} style={{'--i': index}}/>
                            ))}
                        </div>
                    ) : null}

                    {mode !== 'idle' && offers !== null && offers.length > 0 ? (
                        <div key={`${mode}:${trimmed}:${sorting}`} className={style.grid}>
                            {offers.map((offer, index) => (
                                <OfferCard
                                    key={offer.key}
                                    offer={offer}
                                    index={index}
                                    showOrigin
                                    onOpen={openOffer}
                                />
                            ))}
                        </div>
                    ) : null}

                    {mode === 'results' && offers !== null && offers.length === 0 ? (
                        <NothingFound
                            query={trimmed}
                            suggestions={search.suggestions}
                            originOf={originOf}
                            onOpen={openOffer}
                            onReset={reset}
                            onOpenCatalog={() => navigate('/')}
                        />
                    ) : null}

                    {mode === 'browse' && offers !== null && offers.length === 0 ? (
                        <EmptyState
                            title="Под такие фильтры ничего нет"
                            text="Снимите часть условий — обычно это открывает десятки позиций"
                            actionLabel="Сбросить фильтры"
                            onAction={reset}
                        />
                    ) : null}

                    {mode === 'browse' && browse.isLoadingMore ? (
                        <div className={style.grid}>
                            {Array.from({length: 4}, (row, index) => (
                                <div key={`more-${index}`} className={style.skeleton} style={{'--i': index}}/>
                            ))}
                        </div>
                    ) : null}

                    <div ref={sentinelRef} className={style.sentinel} aria-hidden="true"/>
                </div>
            </div>
        </div>
    );
}

function IdleBoard({categories, genres, recent, onApply, onPickRecent, onForgetRecent, onClearRecent}) {
    return (
        <div className={style.idle}>
            {categories.length ? (
                <Reveal as="section" className={style.section}>
                    <span className={style.sectionTitle}>Категории</span>

                    <div className={style.tiles}>
                        {categories.map((tile, index) => (
                            <button
                                key={tile.type}
                                type="button"
                                className={style.tile}
                                style={{'--i': index}}
                                onClick={() => onApply(tile.filters)}
                            >
                                <span className={style.tileTitle}>{tile.title}</span>
                                <span className={style.tileNote}>{tile.note}</span>
                            </button>
                        ))}
                    </div>
                </Reveal>
            ) : null}

            {genres.length ? (
                <Reveal as="section" className={style.section} delay={60}>
                    <span className={style.sectionTitle}>Жанры</span>

                    <div className={style.genres}>
                        {genres.map((genre, index) => (
                            <button
                                key={genre.value}
                                type="button"
                                className={style.genre}
                                style={{'--i': index}}
                                onClick={() => onApply(genre.filters)}
                            >
                                {genre.label}
                            </button>
                        ))}
                    </div>
                </Reveal>
            ) : null}

            {recent.length ? (
                <Reveal as="section" className={style.section} delay={120}>
                    <div className={style.sectionHead}>
                        <span className={style.sectionTitle}>Недавние запросы</span>
                        <button type="button" className={style.sectionAction} onClick={onClearRecent}>
                            Очистить
                        </button>
                    </div>

                    <div className={style.recent}>
                        {recent.map((value, index) => (
                            <span key={value} className={style.recentRow} style={{'--i': index}}>
                                <button
                                    type="button"
                                    className={style.recentPick}
                                    onClick={() => onPickRecent(value)}
                                >
                                    <span className={style.recentIcon} aria-hidden="true">↺</span>
                                    {value}
                                </button>

                                <button
                                    type="button"
                                    className={style.recentDrop}
                                    aria-label={`Убрать «${value}»`}
                                    onClick={() => onForgetRecent(value)}
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>
                </Reveal>
            ) : null}
        </div>
    );
}

function NothingFound({query, suggestions, originOf, onOpen, onReset, onOpenCatalog}) {
    const offers = useMemo(
        () => mergeOffers(suggestions || [], originOf),
        [suggestions, originOf]
    );

    return (
        <div className={style.nothing}>
            <span className={style.nothingIcon} aria-hidden="true">🔍</span>
            <span className={style.nothingTitle}>По запросу «{query}» ничего не нашлось</span>
            <span className={style.nothingNote}>
                Проверьте написание — игры в каталоге под оригинальными названиями
            </span>

            <div className={style.nothingActions}>
                <button type="button" className={style.nothingPrimary} onClick={onReset}>
                    Сбросить поиск
                </button>
                <button type="button" className={style.nothingSecondary} onClick={onOpenCatalog}>
                    Открыть каталог
                </button>
            </div>

            {offers.length ? (
                <div className={style.suggestions}>
                    <span className={style.sectionTitle}>Возможно, вы искали</span>

                    <div className={style.grid}>
                        {offers.slice(0, 5).map((offer, index) => (
                            <OfferCard
                                key={offer.key}
                                offer={offer}
                                index={index}
                                showOrigin
                                onOpen={onOpen}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
