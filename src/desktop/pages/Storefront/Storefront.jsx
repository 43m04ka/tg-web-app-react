import React, {useCallback, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../../store/useSessionStore';
import {useStructureStore} from '../../../store/useStructureStore';
import {usePlatform} from '../../../shared/hooks/usePlatform';
import {useCatalogProducts} from '../../../pages/Catalog/useCatalogProducts';
import {createProductOrigin} from '../../../shared/lib/productOrigin';
import {productRoute} from '../../../shared/lib/pageRoutes';
import EmptyState from '../../../shared/ui/EmptyState/EmptyState';
import {resolveBotType, storefrontList} from '../../model/desktopNav';
import {storefrontConfig} from '../../model/storefrontConfig';
import StorefrontCard from './StorefrontCard';
import style from './Storefront.module.scss';

const SKELETON_COUNT = 12;

export default function Storefront() {
    const navigate = useNavigate();
    const {botType} = usePlatform();

    const pages = useStructureStore((store) => store.pages);
    const startPages = useStructureStore((store) => store.startPages);
    const catalogs = useStructureStore((store) => store.catalogs);
    const setPageId = useSessionStore((store) => store.setPageId);

    const [scopeId, setScopeId] = useState(null);

    const config = storefrontConfig(null);

    const storefronts = useMemo(
        () => storefrontList(startPages, pages, botType),
        [startPages, pages, botType]
    );

    const effectiveBotType = useMemo(
        () => resolveBotType(startPages, botType),
        [startPages, botType]
    );

    const query = useMemo(() => (scopeId === null
        ? {allPages: true, botType: effectiveBotType, sorting: config.sorting}
        : {pageId: scopeId, sorting: config.sorting}), [scopeId, effectiveBotType, config.sorting]);

    const {items, total, hasMore, isLoading, isLoadingMore, error, loadMore, retry} =
        useCatalogProducts(query, {enabled: Array.isArray(startPages)});

    const originOf = useMemo(
        () => createProductOrigin({catalogs, pages, startPages}),
        [catalogs, pages, startPages]
    );

    const openProduct = useCallback((product) => {
        const origin = originOf(product);
        if (origin) setPageId(origin.pageId);

        navigate(productRoute(product, catalogs) || `/card/${product.id}`);
    }, [catalogs, navigate, originOf, setPageId]);

    const isFirstLoad = isLoading && !isLoadingMore && items === null;

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
                    </button>
                ))}
            </div>

            {error && items === null ? (
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

            {items !== null ? (
                <>
                    {items.length === 0 && !isLoading ? (
                        <EmptyState title="Пока пусто" text="В этой витрине нет товаров"/>
                    ) : null}

                    <div className={style.grid}>
                        {items.map((product) => (
                            <StorefrontCard
                                key={`${product.catalogId}:${product.id}`}
                                product={product}
                                origin={scopeId === null ? originOf(product) : null}
                                onOpen={openProduct}
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
        </div>
    );
}
