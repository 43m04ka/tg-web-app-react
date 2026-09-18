import React, {useCallback, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../../store/useSessionStore';
import {useStructureStore} from '../../../store/useStructureStore';
import {usePlatform} from '../../../shared/hooks/usePlatform';
import {useCatalogProducts} from '../../../pages/Catalog/useCatalogProducts';
import {createProductOrigin} from '../../../shared/lib/productOrigin';
import {catalogRoute, productRoute} from '../../../shared/lib/pageRoutes';
import EmptyState from '../../../shared/ui/EmptyState/EmptyState';
import {useWindowScrollMemory} from '../../shell/useWindowScrollMemory';
import {useOpenHero} from '../../shell/useOpenHero';
import {originIndex, resolveBotType, storefrontList} from '../../model/desktopNav';
import {storefrontConfig} from '../../model/storefrontConfig';
import {buildHero, buildShelves, mergeOffers} from '../../model/storefrontModel';
import OfferCard from './OfferCard';
import Shelf from './Shelf';
import StorefrontHero from './StorefrontHero';
import style from './Storefront.module.scss';

const SKELETON_COUNT = 12;

export default function Storefront() {
    const navigate = useNavigate();
    const {botType} = usePlatform();

    const pages = useStructureStore((store) => store.pages);
    const startPages = useStructureStore((store) => store.startPages);
    const catalogs = useStructureStore((store) => store.catalogs);
    const structureBlocks = useStructureStore((store) => store.structureBlocks);
    const mainPageProducts = useStructureStore((store) => store.mainPageProducts);
    const banners = useStructureStore((store) => store.banners);

    const setPageId = useSessionStore((store) => store.setPageId);

    const [scopeId, setScopeId] = useState(null);

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
            limit: config.heroSize
        }),
        [banners, mainPageProducts, originOf, originByPage, pageIds, scopeId, config.heroSize]
    );

    const shelves = useMemo(
        () => buildShelves({structureBlocks, catalogs, mainPageProducts, originOf, pageIds, scopeId}),
        [structureBlocks, catalogs, mainPageProducts, originOf, pageIds, scopeId]
    );

    const query = useMemo(() => (scopeId === null
        ? {allPages: true, botType: effectiveBotType, sorting: config.sorting}
        : {pageId: scopeId, sorting: config.sorting}), [scopeId, effectiveBotType, config.sorting]);

    const {items, total, hasMore, isLoading, isLoadingMore, error, loadMore, retry} =
        useCatalogProducts(query, {enabled: Array.isArray(startPages)});

    const catalogOffers = useMemo(
        () => (items === null ? null : mergeOffers(items, originOf)),
        [items, originOf]
    );

    const openOffer = useCallback((offer) => {
        const origin = offer.origins[0] || originOf(offer.product);
        if (origin) setPageId(origin.pageId);

        navigate(productRoute(offer.product, catalogs) || `/card/${offer.product.id}`);
    }, [catalogs, navigate, originOf, setPageId]);

    const openHero = useOpenHero();

    const openCatalog = useCallback((target) => {
        setPageId(target.pageId);
        navigate(catalogRoute(target.path));
    }, [navigate, setPageId]);

    const isFirstLoad = isLoading && !isLoadingMore && catalogOffers === null;
    const showOrigin = scopeId === null;

    useWindowScrollMemory(`storefront:${scopeId ?? 'all'}`, {ready: catalogOffers !== null});

    return (
        <div className={style.screen}>
            <header className={style.head}>
                <h1 className={style.title}>{config.title}</h1>
                <p className={style.subtitle}>{config.subtitle}</p>
            </header>

            <div className={style.chips}>
                <button
                    type="button"
                    className={`${style.chip} ${scopeId === null ? style.chipActive : ''}`}
                    onClick={() => setScopeId(null)}
                >
                    {config.allChipLabel}
                    {scopeId === null && total ? <span className={style.chipCount}>{total}</span> : null}
                </button>

                {storefronts.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`${style.chip} ${scopeId === item.id ? style.chipActive : ''}`}
                        onClick={() => setScopeId(item.id)}
                    >
                        {item.icon ? (
                            <span
                                className={style.chipIcon}
                                style={{backgroundImage: `url(${item.icon})`}}
                                aria-hidden="true"
                            />
                        ) : null}
                        {item.label}
                        {scopeId === item.id && total ? <span className={style.chipCount}>{total}</span> : null}
                    </button>
                ))}
            </div>

            <StorefrontHero items={hero} onOpen={openHero}/>

            {(shelves || []).map((shelf) => (
                <Shelf
                    key={shelf.key}
                    shelf={shelf}
                    size={config.shelfSize}
                    showOrigin={showOrigin}
                    onOpen={openOffer}
                    onOpenCatalog={openCatalog}
                />
            ))}

            <section className={style.shelf}>
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
                            <div key={index} className={style.skeleton}/>
                        ))}
                    </div>
                ) : null}

                {catalogOffers !== null ? (
                    <>
                        {catalogOffers.length === 0 && !isLoading ? (
                            <EmptyState title="Пока пусто" text="В этой витрине нет товаров"/>
                        ) : null}

                        <div className={style.grid}>
                            {catalogOffers.map((offer) => (
                                <OfferCard
                                    key={offer.key}
                                    offer={offer}
                                    showOrigin={showOrigin}
                                    onOpen={openOffer}
                                />
                            ))}
                        </div>

                        {hasMore ? (
                            <div className={style.more}>
                                <button
                                    type="button"
                                    className={style.moreButton}
                                    onClick={loadMore}
                                    disabled={isLoadingMore}
                                >
                                    {isLoadingMore ? 'Загружаем…' : 'Показать ещё'}
                                </button>
                            </div>
                        ) : null}
                    </>
                ) : null}
            </section>
        </div>
    );
}
