import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../../store/useSessionStore';
import {useStructureStore} from '../../../store/useStructureStore';
import {usePlatform} from '../../../shared/hooks/usePlatform';
import {useCatalogProducts} from '../../../pages/Catalog/useCatalogProducts';
import {createProductOrigin} from '../../../shared/lib/productOrigin';
import {catalogRoute, productRoute} from '../../../shared/lib/pageRoutes';
import EmptyState from '../../../shared/ui/EmptyState/EmptyState';
import {useScrollMemory} from '../../shell/ScrollAreaContext';
import {useStorefrontScope} from '../../shell/StorefrontScope';
import {useReveal} from '../../shell/useReveal';
import {useOpenHero} from '../../shell/useOpenHero';
import {useOfferPicker} from '../../shell/useOfferPicker';
import {useGridColumns} from '../../shell/useGridColumns';
import {originIndex, resolveBotType, storefrontList} from '../../model/desktopNav';
import {storefrontConfig} from '../../model/storefrontConfig';
import {buildHero, buildShelves, mergeOffers} from '../../model/storefrontModel';
import OfferCard from './OfferCard';
import Shelf from './Shelf';
import SubscriptionShelf, {groupShelves} from './SubscriptionShelf';
import StorefrontHero from './StorefrontHero';
import OfferSplit from './OfferSplit';
import style from './Storefront.module.scss';

const TAGLINE = [
    ['Геймворд'],
    ['—'],
    ['игры'],
    ['и'],
    ['подписки'],
    ['для'],
    ['PlayStation', 'ps'],
    ['и'],
    ['Xbox', 'xbox']
];

const SKELETON_COUNT = 12;
const ROWS_STEP = 3;

export default function Storefront() {
    const navigate = useNavigate();
    const {botType} = usePlatform();

    const pages = useStructureStore((store) => store.pages);
    const startPages = useStructureStore((store) => store.startPages);
    const catalogs = useStructureStore((store) => store.catalogs);
    const structureBlocks = useStructureStore((store) => store.structureBlocks);
    const mainPageProducts = useStructureStore((store) => store.mainPageProducts);
    const banners = useStructureStore((store) => store.banners);
    const mainPageId = useStructureStore((store) => store.mainPageId);

    const setPageId = useSessionStore((store) => store.setPageId);

    const {scopeId} = useStorefrontScope();

    const config = storefrontConfig(null);

    const storefronts = useMemo(
        () => storefrontList(startPages, pages, botType),
        [startPages, pages, botType]
    );

    const pageIds = useMemo(() => storefronts.map((item) => item.id), [storefronts]);

    const effectiveBotType = useMemo(
        () => resolveBotType(startPages, botType),
        [startPages, botType]
    );

    const originOf = useMemo(
        () => createProductOrigin({catalogs, pages, startPages}),
        [catalogs, pages, startPages]
    );

    const originByPage = useMemo(
        () => originIndex(startPages, pages, botType),
        [startPages, pages, botType]
    );

    const hero = useMemo(
        () => buildHero({
            banners,
            mainPageProducts,
            originOf,
            originByPage,
            pageIds,
            scopeId,
            mainPageId,
            limit: Infinity
        }),
        [banners, mainPageProducts, originOf, originByPage, pageIds, scopeId, mainPageId]
    );

    const shelves = useMemo(
        () => buildShelves({structureBlocks, catalogs, mainPageProducts, originOf, pageIds, scopeId, mainPageId}),
        [structureBlocks, catalogs, mainPageProducts, originOf, pageIds, scopeId, mainPageId]
    );

    const shelfEntries = useMemo(() => groupShelves(shelves), [shelves]);

    const filteredKey = useMemo(() => {
        const plain = shelfEntries.filter((entry) => entry.kind === 'shelf');
        return (plain.find((entry) => /популярн/i.test(entry.shelf.title)) || plain[0])?.key ?? null;
    }, [shelfEntries]);

    const query = useMemo(() => (scopeId === null
        ? {allPages: true, botType: effectiveBotType, sorting: config.sorting}
        : {pageId: scopeId, sorting: config.sorting}), [scopeId, effectiveBotType, config.sorting]);

    const {items, total, hasMore, isLoading, isLoadingMore, error, loadMore, retry} =
        useCatalogProducts(query, {enabled: Array.isArray(startPages)});

    const catalogOffers = useMemo(
        () => (items === null ? null : mergeOffers(items, originOf)),
        [items, originOf]
    );

    const picker = useOfferPicker({originOf});
    const openOffer = picker.open;

    const catalogRef = useReveal();

    const columns = useGridColumns();
    const [rows, setRows] = useState(ROWS_STEP);

    useEffect(() => {
        setRows(ROWS_STEP);
    }, [scopeId]);

    const limit = rows * columns;
    const loadedCount = catalogOffers?.length ?? 0;

    useEffect(() => {
        if (loadedCount < limit && hasMore && !isLoading && !isLoadingMore && !error) loadMore();
    }, [loadedCount, limit, hasMore, isLoading, isLoadingMore, error, loadMore]);

    const visibleOffers = useMemo(
        () => (catalogOffers === null ? null : catalogOffers.slice(0, limit)),
        [catalogOffers, limit]
    );

    const canShowMore = loadedCount > limit || hasMore;
    const isFilling = loadedCount < limit && hasMore;

    const showMore = useCallback(() => setRows((value) => value + ROWS_STEP), []);

    const openHero = useOpenHero();

    const openCatalog = useCallback((target) => {
        setPageId(target.pageId);
        navigate(catalogRoute(target.path));
    }, [navigate, setPageId]);

    const isFirstLoad = isLoading && !isLoadingMore && catalogOffers === null;
    const showOrigin = scopeId === null;

    useScrollMemory(`storefront:${scopeId ?? 'all'}`, {ready: catalogOffers !== null});

    return (
        <div className={style.screen}>
            <OfferSplit offer={picker.picked} onPick={picker.pick} onClose={picker.close}/>

            <StorefrontHero items={hero} onOpen={openHero}/>

            <h1 className={style.tagline} aria-label={TAGLINE.map(([word]) => word).join(' ')}>
                {TAGLINE.map(([word, tone], index) => (
                    <React.Fragment key={index}>
                        {index ? ' ' : null}
                        <span
                            className={`${style.taglineWord} ${tone ? `${style[tone]} ${style.shine}` : ''}`}
                            style={{'--w': index}}
                            aria-hidden="true"
                        >
                            {word}
                        </span>
                    </React.Fragment>
                ))}
            </h1>

            {config.steps.length ? (
                <ol className={style.steps}>
                    {config.steps.map((step, index) => (
                        <li key={step.title} className={style.step} style={{'--i': index}}>
                            <span className={style.stepNumber}>{index + 1}</span>
                            <span className={style.stepBody}>
                                <span className={style.stepTitle}>{step.title}</span>
                                <span className={style.stepText}>{step.text}</span>
                            </span>
                        </li>
                    ))}
                </ol>
            ) : null}

            {shelfEntries.map((entry) => (entry.kind === 'subscriptions' ? (
                <SubscriptionShelf
                    key={entry.key}
                    items={entry.items}
                    family={entry.family}
                    onOpen={openOffer}
                    onOpenCatalog={openCatalog}
                />
            ) : (
                <Shelf
                    key={entry.key}
                    shelf={entry.shelf}
                    size={config.shelfSize}
                    showOrigin={showOrigin}
                    withFilters={entry.key === filteredKey}
                    onOpen={openOffer}
                    onOpenCatalog={openCatalog}
                />
            )))}

            <section className={style.shelf} ref={catalogRef} data-reveal="out">
                <header className={style.shelfHead}>
                    <span className={style.shelfTitle}>{config.catalogTitle}</span>
                    {total ? <span className={style.shelfNote}>{total.toLocaleString('ru-RU')}</span> : null}
                </header>

                {error && catalogOffers === null ? (
                    <EmptyState
                        title="Не удалось загрузить каталог"
                        text="Проверьте соединение и попробуйте снова"
                        actionLabel="Повторить"
                        onAction={retry}
                    />
                ) : null}

                {isFirstLoad ? (
                    <div className={style.grid}>
                        {Array.from({length: SKELETON_COUNT}, (skeleton, index) => (
                            <div key={index} className={style.skeleton} style={{'--i': index}}/>
                        ))}
                    </div>
                ) : null}

                {catalogOffers !== null ? (
                    <>
                        {catalogOffers.length === 0 && !isLoading ? (
                            <EmptyState title="Пока пусто" text="В этой витрине нет товаров"/>
                        ) : null}

                        <div key={scopeId ?? 'all'} className={style.grid}>
                            {visibleOffers.map((offer, index) => (
                                <OfferCard
                                    key={offer.key}
                                    offer={offer}
                                    index={index}
                                    showOrigin={showOrigin}
                                    showRelease
                                    onOpen={openOffer}
                                />
                            ))}

                            {isFilling ? Array.from({length: Math.min(columns, limit - loadedCount)}, (skeleton, index) => (
                                <div key={`more-${index}`} className={style.skeleton} style={{'--i': index}}/>
                            )) : null}
                        </div>

                        {canShowMore && !isFilling ? (
                            <button type="button" className={style.more} onClick={showMore}>
                                Показать ещё
                            </button>
                        ) : null}
                    </>
                ) : null}
            </section>
        </div>
    );
}
