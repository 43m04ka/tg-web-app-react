import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useStructureStore} from '../../../store/useStructureStore';
import {useSessionStore} from '../../../store/useSessionStore';
import {useCatalogProducts} from '../../../pages/Catalog/useCatalogProducts';
import {cleanPath} from '../../../pages/Main/catalogSections';
import {loadFacets, peekFacets} from '../../../shared/api/facetsCache';
import {createProductOrigin} from '../../../shared/lib/productOrigin';
import {productRoute} from '../../../shared/lib/pageRoutes';
import {recallView, rememberView} from '../../../shared/lib/viewMemory';
import {
    SORTINGS,
    countActiveFilters,
    createFilters,
    describeFilters,
    productsPlural
} from '../../../shared/lib/catalogQuery';
import EmptyState from '../../../shared/ui/EmptyState/EmptyState';
import {mergeOffers} from '../../model/storefrontModel';
import {useNearBottom} from '../../../shared/hooks/useNearBottom';
import SelectMenu from '../../ui/SelectMenu';
import {useScrollArea, useScrollMemory} from '../../shell/ScrollAreaContext';
import OfferCard from '../Storefront/OfferCard';
import OfferSplit from '../Storefront/OfferSplit';
import {useOfferPicker} from '../../shell/useOfferPicker';
import FilterPanel from './FilterPanel';
import style from './DesktopCatalog.module.scss';

const SKELETON_COUNT = 12;

export default function DesktopCatalog() {
    const navigate = useNavigate();
    const params = useParams();

    const path = cleanPath(params['*'] || '');

    const catalogs = useStructureStore((store) => store.catalogs);
    const pages = useStructureStore((store) => store.pages);
    const startPages = useStructureStore((store) => store.startPages);
    const structureBlocks = useStructureStore((store) => store.structureBlocks);
    const setPageId = useSessionStore((store) => store.setPageId);

    const catalogId = useMemo(
        () => (catalogs || []).find((catalog) => catalog.path === path)?.id ?? null,
        [catalogs, path]
    );

    const title = useMemo(
        () => (structureBlocks || []).find((block) => cleanPath(block.path) === path)?.name || 'Каталог',
        [structureBlocks, path]
    );

    const formKey = `desktop:catalog:${path}`;
    const saved = useRef(recallView(formKey)).current;

    const [filters, setFilters] = useState(() => saved?.filters || createFilters());
    const [sorting, setSorting] = useState(() => saved?.sorting || 'default');
    const [{facets, price}, setFacetData] = useState(() => peekFacets({catalogId}));

    const query = useMemo(() => ({catalogId, filters, sorting}), [catalogId, filters, sorting]);

    const {items, total, hasMore, isLoading, isLoadingMore, error, loadMore, retry} =
        useCatalogProducts(query, {enabled: catalogId !== null});

    const originOf = useMemo(
        () => createProductOrigin({catalogs, pages, startPages}),
        [catalogs, pages, startPages]
    );

    const offers = useMemo(
        () => (items === null ? null : mergeOffers(items, originOf)),
        [items, originOf]
    );

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

    const picker = useOfferPicker({originOf});
    const openOffer = picker.open;

    const areaRef = useScrollArea();

    const formStamp = JSON.stringify({filters, sorting});
    const formStampRef = useRef(formStamp);

    useEffect(() => {
        if (formStampRef.current === formStamp) return;

        formStampRef.current = formStamp;
        areaRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
    }, [formStamp, areaRef]);

    const sentinelRef = useNearBottom({
        rootRef: areaRef,
        enabled: hasMore && !isLoading && !error,
        onReach: loadMore
    });

    useScrollMemory(`catalog:${path}`, {ready: offers !== null});

    const chips = describeFilters(filters, facets);
    const activeCount = countActiveFilters(filters);
    const isMissing = Array.isArray(catalogs) && catalogId === null;
    const isFirstLoad = isLoading && !isLoadingMore && offers === null;

    if (isMissing) {
        return (
            <EmptyState
                title="Каталог не найден"
                text="Раздел мог быть переименован или скрыт"
                actionLabel="На главную"
                onAction={() => navigate('/')}
            />
        );
    }

    return (
        <div className={style.screen}>
            <OfferSplit offer={picker.picked} onPick={picker.pick} onClose={picker.close}/>

            <FilterPanel filters={filters} facets={facets} price={price} onChange={setFilters}/>

            <div className={style.content}>
                <header className={style.head}>
                    <div className={style.headText}>
                        <h1 className={style.title}>{title}</h1>
                        <span className={style.count}>
                            {total ? `${total.toLocaleString('ru-RU')} ${productsPlural(total)}` : ' '}
                        </span>
                    </div>

                    <div className={style.sort}>
                        <span className={style.sortLabel}>Сортировка</span>
                        <SelectMenu
                            options={SORTINGS}
                            value={sorting}
                            onChange={setSorting}
                            label="Сортировка"
                        />
                    </div>
                </header>

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

                {error && offers === null ? (
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

                {offers !== null ? (
                    <>
                        {offers.length === 0 && !isLoading ? (
                            <EmptyState
                                title="Ничего не нашлось"
                                text={activeCount > 0
                                    ? 'Попробуйте снять часть фильтров'
                                    : 'В этом разделе пока нет товаров'}
                                actionLabel={activeCount > 0 ? 'Сбросить фильтры' : undefined}
                                onAction={activeCount > 0 ? () => setFilters(createFilters()) : undefined}
                            />
                        ) : null}

                        <div key={sorting} className={style.grid}>
                            {offers.map((offer, index) => (
                                <OfferCard
                                    key={offer.key}
                                    offer={offer}
                                    index={index}
                                    showOrigin={false}
                                    showAlso={false}
                                    showRelease
                                    onOpen={openOffer}
                                />
                            ))}

                            {isLoadingMore ? Array.from({length: 4}, (skeleton, index) => (
                                <div key={`more-${index}`} className={style.skeleton} style={{'--i': index}}/>
                            )) : null}
                        </div>

                        <div ref={sentinelRef} className={style.sentinel} aria-hidden="true"/>
                    </>
                ) : null}
            </div>
        </div>
    );
}
