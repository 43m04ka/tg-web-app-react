import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {searchProducts} from '../../shared/api/catalog';
import {useStructureStore} from '../../store/useStructureStore';
import {useSessionStore} from '../../store/useSessionStore';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {createProductOrigin} from '../../shared/lib/productOrigin';
import {productRoute} from '../../shared/lib/pageRoutes';
import {formatPrice} from '../../pages/Main/catalogSections';
import {clearRecentSearches, forgetSearch, loadRecentSearches, rememberSearch} from '../../pages/Search/recentSearches';
import {loadFacets, peekFacets} from '../../shared/api/facetsCache';
import {buildCategories, buildGenres} from '../../pages/Search/searchSections';
import {scopeFilter} from '../model/storefrontTotals';
import {useStorefrontScope} from './StorefrontScope';
import {resolveBotType} from '../model/desktopNav';
import {mergeOffers} from '../model/storefrontModel';
import Cover from '../ui/Cover';
import {SearchIcon} from './DesktopIcons';
import style from './SearchBox.module.scss';

const DEBOUNCE_MS = 240;
const MIN_QUERY = 2;
const LIMIT = 6;
const SKELETONS = 4;

const highlight = (text, needle) => {
    const source = String(text || '');
    const query = needle.trim().toLowerCase();
    if (query.length < MIN_QUERY) return source;

    const index = source.toLowerCase().indexOf(query);
    if (index < 0) return source;

    return [
        source.slice(0, index),
        <mark key="hit" className={style.mark}>{source.slice(index, index + query.length)}</mark>,
        source.slice(index + query.length)
    ];
};

export default function SearchBox({onOpenChange, hidden = false, wide = false}) {
    const navigate = useNavigate();
    const {botType} = usePlatform();

    const pages = useStructureStore((store) => store.pages);
    const startPages = useStructureStore((store) => store.startPages);
    const catalogs = useStructureStore((store) => store.catalogs);
    const setPageId = useSessionStore((store) => store.setPageId);

    const [query, setQuery] = useState('');
    const [isOpen, setOpen] = useState(false);
    const [items, setItems] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [cursor, setCursor] = useState(-1);
    const [recent, setRecent] = useState(() => loadRecentSearches());

    const rootRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    const originOf = useMemo(
        () => createProductOrigin({catalogs, pages, startPages}),
        [catalogs, pages, startPages]
    );

    const effectiveBotType = useMemo(
        () => resolveBotType(startPages, botType),
        [startPages, botType]
    );

    const {scopeId} = useStorefrontScope();

    const scope = useMemo(
        () => scopeFilter(scopeId, effectiveBotType),
        [scopeId, effectiveBotType]
    );

    const [{facets}, setFacetData] = useState(() => peekFacets(scope));

    const trimmed = query.trim();
    const isSearching = trimmed.length >= MIN_QUERY;

    useEffect(() => {
        onOpenChange?.(isOpen);
    }, [isOpen, onOpenChange]);

    useEffect(() => {
        if (!isSearching) {
            setItems(null);
            setLoading(false);
            return undefined;
        }

        const controller = new AbortController();
        setLoading(true);

        const timerId = setTimeout(() => {
            searchProducts({query: trimmed, ...scope, perPage: 24}, controller.signal)
                .then((payload) => {
                    if (controller.signal.aborted) return;
                    const found = Array.isArray(payload?.items) ? payload.items : [];
                    setItems(mergeOffers(found, originOf).slice(0, LIMIT));
                    setLoading(false);
                })
                .catch(() => {
                    if (controller.signal.aborted) return;
                    setItems([]);
                    setLoading(false);
                });
        }, DEBOUNCE_MS);

        return () => {
            controller.abort();
            clearTimeout(timerId);
        };
    }, [trimmed, isSearching, scope, originOf]);

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

    useEffect(() => {
        setCursor(-1);
    }, [trimmed]);

    const close = useCallback(() => {
        setOpen(false);
        setCursor(-1);
        inputRef.current?.blur();
    }, []);

    useEffect(() => {
        const onHotkey = (event) => {
            const target = event.target;
            const isTyping = target instanceof HTMLElement
                && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

            const isSlash = event.key === '/' && !isTyping;
            const isCommand = String(event.key).toLowerCase() === 'k' && (event.metaKey || event.ctrlKey);

            if (!isSlash && !isCommand) return;

            event.preventDefault();
            inputRef.current?.focus();
            inputRef.current?.select();
        };

        document.addEventListener('keydown', onHotkey);
        return () => document.removeEventListener('keydown', onHotkey);
    }, []);

    useEffect(() => {
        if (!isOpen) return undefined;

        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) close();
        };

        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [isOpen, close]);

    useEffect(() => {
        if (cursor < 0) return;
        listRef.current?.querySelector('[data-row="' + cursor + '"]')?.scrollIntoView({block: 'nearest'});
    }, [cursor]);

    const openFullSearch = useCallback((value) => {
        const target = String(value ?? trimmed).trim();
        if (target.length >= MIN_QUERY) setRecent(rememberSearch(target));

        close();
        setQuery('');
        navigate('/search', {state: {query: target, stamp: Date.now()}});
    }, [close, navigate, trimmed]);

    const openSection = useCallback((filters) => {
        close();
        setQuery('');
        navigate('/search', {state: {filters, stamp: Date.now()}});
    }, [close, navigate]);

    const openOffer = useCallback((offer) => {
        const origin = offer.origins[0] || originOf(offer.product);
        if (origin) setPageId(origin.pageId);
        if (trimmed.length >= MIN_QUERY) setRecent(rememberSearch(trimmed));

        close();
        setQuery('');
        navigate(productRoute(offer.product, catalogs) || `/card/${offer.product.id}`);
    }, [catalogs, close, navigate, originOf, setPageId, trimmed]);

    const results = Array.isArray(items) ? items : [];
    const hasResults = results.length > 0;
    const isEmpty = Array.isArray(items) && items.length === 0 && !isLoading;
    const rowCount = hasResults ? results.length + 1 : 0;

    const onKeyDown = useCallback((event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            if (query) setQuery('');
            else close();
            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if (!rowCount) return;
            event.preventDefault();

            const step = event.key === 'ArrowDown' ? 1 : -1;

            setCursor((current) => {
                const next = current + step;
                if (next < 0) return rowCount - 1;
                if (next >= rowCount) return 0;
                return next;
            });
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            if (cursor >= 0 && cursor < results.length) openOffer(results[cursor]);
            else if (isSearching) openFullSearch();
        }
    }, [close, cursor, isSearching, openFullSearch, openOffer, query, results, rowCount]);

    const pickRecent = useCallback((value) => {
        setQuery(value);
        inputRef.current?.focus();
    }, []);

    const categories = useMemo(() => buildCategories(facets), [facets]);
    const genres = useMemo(() => buildGenres(facets, 8), [facets]);

    const showRecent = isOpen && !isSearching && recent.length > 0;
    const showBoard = isOpen && !isSearching && (categories.length > 0 || genres.length > 0);
    const showPanel = isOpen && (isSearching || showRecent || showBoard);

    return (
        <div
            className={[
                style.root,
                isOpen ? style.rootOpen : '',
                wide ? style.rootWide : '',
                hidden ? style.rootHidden : ''
            ].filter(Boolean).join(' ')}
            data-hidden={hidden ? '' : undefined}
            aria-hidden={hidden ? 'true' : undefined}
            ref={rootRef}
        >
            <form
                className={style.field}
                role="search"
                onSubmit={(event) => {
                    event.preventDefault();
                    if (isSearching) openFullSearch();
                }}
            >
                <button
                    type="button"
                    className={style.iconButton}
                    tabIndex={-1}
                    aria-label="Поставить курсор в поиск"
                    onClick={() => inputRef.current?.focus()}
                >
                    <SearchIcon className={style.icon}/>
                </button>

                <input
                    ref={inputRef}
                    className={style.input}
                    type="text"
                    value={query}
                    placeholder="Поиск игры или подписки"
                    autoComplete="off"
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    aria-label="Поиск по витрине"
                />

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
                ) : (
                    <span className={style.hotkey} aria-hidden="true">/</span>
                )}
            </form>

            <div className={showPanel ? style.drop + ' ' + style.dropOpen : style.drop} ref={listRef}>
                <div className={style.dropInner}>
                    {showBoard && categories.length ? (
                        <div className={style.block}>
                            <div className={style.blockHead}>
                                <span className={style.blockTitle}>Категории</span>
                            </div>

                            <div className={style.tiles}>
                                {categories.map((tile, index) => (
                                    <button
                                        key={tile.type}
                                        type="button"
                                        className={style.tile}
                                        style={{'--i': index}}
                                        onClick={() => openSection(tile.filters)}
                                    >
                                        <span className={style.tileTitle}>{tile.title}</span>
                                        <span className={style.tileNote}>{tile.note}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {showBoard && genres.length ? (
                        <div className={style.block}>
                            <div className={style.blockHead}>
                                <span className={style.blockTitle}>Жанры</span>
                            </div>

                            <div className={style.genres}>
                                {genres.map((genre, index) => (
                                    <button
                                        key={genre.value}
                                        type="button"
                                        className={style.genre}
                                        style={{'--i': index}}
                                        onClick={() => openSection(genre.filters)}
                                    >
                                        {genre.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {showRecent ? (
                        <div className={style.block}>
                            <div className={style.blockHead}>
                                <span className={style.blockTitle}>Недавние запросы</span>
                                <button
                                    type="button"
                                    className={style.blockAction}
                                    onClick={() => setRecent(clearRecentSearches())}
                                >
                                    Очистить
                                </button>
                            </div>

                            <div className={style.recent}>
                                {recent.map((value, index) => (
                                    <span key={value} className={style.recentRow} style={{'--i': index}}>
                                        <button
                                            type="button"
                                            className={style.recentPick}
                                            onClick={() => pickRecent(value)}
                                        >
                                            <span className={style.recentIcon} aria-hidden="true">↺</span>
                                            {value}
                                        </button>

                                        <button
                                            type="button"
                                            className={style.recentDrop}
                                            aria-label={'Убрать «' + value + '»'}
                                            onClick={() => setRecent(forgetSearch(value))}
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {isSearching && isLoading && !hasResults ? (
                        <div className={style.results}>
                            {Array.from({length: SKELETONS}, (row, index) => (
                                <span key={index} className={style.skeleton} style={{'--i': index}}>
                                    <span className={style.skeletonCover}/>
                                    <span className={style.skeletonText}>
                                        <span className={style.skeletonLine}/>
                                        <span className={style.skeletonLine + ' ' + style.skeletonLineShort}/>
                                    </span>
                                </span>
                            ))}
                        </div>
                    ) : null}

                    {isSearching && isEmpty ? (
                        <div className={style.empty}>
                            <span className={style.emptyIcon} aria-hidden="true">🔍</span>
                            <span className={style.emptyTitle}>Ничего не нашлось</span>
                            <span className={style.emptyNote}>
                                Проверьте написание — игры в каталоге под оригинальными названиями
                            </span>
                            <button type="button" className={style.emptyAction} onClick={() => openFullSearch()}>
                                Искать с фильтрами
                            </button>
                        </div>
                    ) : null}

                    {isSearching && hasResults ? (
                        <>
                            <div className={style.results}>
                                {results.map((offer, index) => {
                                    const origin = offer.origins[0] || null;
                                    const more = offer.origins.length - 1;

                                    return (
                                        <button
                                            key={offer.key}
                                            type="button"
                                            data-row={index}
                                            className={cursor === index
                                                ? style.result + ' ' + style.resultOn
                                                : style.result}
                                            style={{'--i': index}}
                                            onMouseEnter={() => setCursor(index)}
                                            onClick={() => openOffer(offer)}
                                        >
                                            <Cover src={offer.product.image} className={style.cover}/>

                                            <span className={style.text}>
                                                <span className={style.name}>
                                                    {highlight(offer.product.name, trimmed)}
                                                </span>

                                                <span className={style.meta}>
                                                    {origin ? (
                                                        <span className={style.origin}>
                                                            {origin.icon ? (
                                                                <span
                                                                    className={style.originIcon}
                                                                    style={{backgroundImage: 'url(' + origin.icon + ')'}}
                                                                    aria-hidden="true"
                                                                />
                                                            ) : null}
                                                            {origin.label}
                                                        </span>
                                                    ) : null}

                                                    {more > 0 ? (
                                                        <span className={style.moreTag}>ещё {more}</span>
                                                    ) : null}
                                                </span>
                                            </span>

                                            <span className={style.price}>
                                                {more > 0 ? <span className={style.from}>от </span> : null}
                                                {formatPrice(offer.price)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                data-row={results.length}
                                className={cursor === results.length ? style.all + ' ' + style.allOn : style.all}
                                onMouseEnter={() => setCursor(results.length)}
                                onClick={() => openFullSearch()}
                            >
                                <span>Показать все результаты</span>
                                <span className={style.enter} aria-hidden="true">Enter ↵</span>
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
