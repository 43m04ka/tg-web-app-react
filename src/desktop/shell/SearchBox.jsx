import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {searchProducts} from '../../shared/api/catalog';
import {useStructureStore} from '../../store/useStructureStore';
import {useSessionStore} from '../../store/useSessionStore';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {createProductOrigin} from '../../shared/lib/productOrigin';
import {productRoute} from '../../shared/lib/pageRoutes';
import {formatPrice} from '../../pages/Main/catalogSections';
import {resolveBotType} from '../model/desktopNav';
import {mergeOffers} from '../model/storefrontModel';
import {SearchIcon} from './DesktopIcons';
import style from './SearchBox.module.scss';

const DEBOUNCE_MS = 260;
const MIN_QUERY = 2;
const LIMIT = 6;

export default function SearchBox() {
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

    const rootRef = useRef(null);
    const inputRef = useRef(null);

    const originOf = useMemo(
        () => createProductOrigin({catalogs, pages, startPages}),
        [catalogs, pages, startPages]
    );

    const effectiveBotType = useMemo(
        () => resolveBotType(startPages, botType),
        [startPages, botType]
    );

    const trimmed = query.trim();

    useEffect(() => {
        if (trimmed.length < MIN_QUERY) {
            setItems(null);
            setLoading(false);
            return undefined;
        }

        const controller = new AbortController();
        setLoading(true);

        const timerId = setTimeout(() => {
            searchProducts({query: trimmed, allPages: true, botType: effectiveBotType, perPage: 18}, controller.signal)
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
    }, [trimmed, effectiveBotType, originOf]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpen(false);
                inputRef.current?.blur();
            }
        };

        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen]);

    const openOffer = useCallback((offer) => {
        const origin = offer.origins[0] || originOf(offer.product);
        if (origin) setPageId(origin.pageId);

        setOpen(false);
        setQuery('');
        navigate(productRoute(offer.product, catalogs) || `/card/${offer.product.id}`);
    }, [catalogs, navigate, originOf, setPageId]);

    const openFullSearch = useCallback(() => {
        setOpen(false);
        navigate('/search', {state: {allPages: true, query: trimmed}});
    }, [navigate, trimmed]);

    const onSubmit = useCallback((event) => {
        event.preventDefault();
        if (trimmed.length >= MIN_QUERY) openFullSearch();
    }, [openFullSearch, trimmed]);

    const hasResults = Array.isArray(items) && items.length > 0;
    const isEmpty = Array.isArray(items) && items.length === 0 && !isLoading;

    return (
        <div className={`${style.root} ${isOpen ? style.rootOpen : ''}`} ref={rootRef}>
            <form className={style.field} onSubmit={onSubmit} role="search">
                <SearchIcon className={style.icon}/>

                <input
                    ref={inputRef}
                    className={style.input}
                    type="text"
                    value={query}
                    placeholder="Поиск игры или подписки"
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => setOpen(true)}
                    aria-label="Поиск по всем витринам"
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
                ) : null}
            </form>

            {isOpen && trimmed.length >= MIN_QUERY ? (
                <div className={style.drop}>
                    {isLoading && !hasResults ? (
                        <div className={style.hint}>Ищем…</div>
                    ) : null}

                    {isEmpty ? (
                        <div className={style.hint}>Ничего не нашлось</div>
                    ) : null}

                    {hasResults ? (
                        <>
                            <div className={style.results}>
                                {items.map((offer, index) => (
                                    <button
                                        key={offer.key}
                                        type="button"
                                        className={style.result}
                                        style={{'--i': index}}
                                        onClick={() => openOffer(offer)}
                                    >
                                        <span
                                            className={style.cover}
                                            style={offer.product.image
                                                ? {backgroundImage: `url(${offer.product.image})`}
                                                : undefined}
                                        />

                                        <span className={style.text}>
                                            <span className={style.name}>{offer.product.name}</span>
                                            {offer.origins[0] ? (
                                                <span className={style.origin}>{offer.origins[0].label}</span>
                                            ) : null}
                                        </span>

                                        <span className={style.price}>{formatPrice(offer.price)}</span>
                                    </button>
                                ))}
                            </div>

                            <button type="button" className={style.all} onClick={openFullSearch}>
                                Показать все результаты
                            </button>
                        </>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
