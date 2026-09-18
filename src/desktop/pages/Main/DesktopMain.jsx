import React, {useCallback, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../../store/useSessionStore';
import {useStructureStore} from '../../../store/useStructureStore';
import {usePlatform} from '../../../shared/hooks/usePlatform';
import {createProductOrigin} from '../../../shared/lib/productOrigin';
import {catalogRoute, productRoute} from '../../../shared/lib/pageRoutes';
import {regionLabel} from '../../../shared/lib/region';
import EmptyState from '../../../shared/ui/EmptyState/EmptyState';
import {originIndex, storefrontList} from '../../model/desktopNav';
import {useOpenHero} from '../../shell/useOpenHero';
import {useOfferPicker} from '../../shell/useOfferPicker';
import {storefrontConfig} from '../../model/storefrontConfig';
import {buildHero, buildShelves} from '../../model/storefrontModel';
import {useScrollMemory} from '../../shell/ScrollAreaContext';
import Shelf from '../Storefront/Shelf';
import StorefrontHero from '../Storefront/StorefrontHero';
import OfferSplit from '../Storefront/OfferSplit';
import style from '../Storefront/Storefront.module.scss';

export default function DesktopMain() {
    const navigate = useNavigate();
    const {botType} = usePlatform();

    const pages = useStructureStore((store) => store.pages);
    const startPages = useStructureStore((store) => store.startPages);
    const catalogs = useStructureStore((store) => store.catalogs);
    const structureBlocks = useStructureStore((store) => store.structureBlocks);
    const mainPageProducts = useStructureStore((store) => store.mainPageProducts);
    const banners = useStructureStore((store) => store.banners);

    const pageId = useSessionStore((store) => store.pageId);
    const setPageId = useSessionStore((store) => store.setPageId);

    const config = storefrontConfig(null);

    const page = useMemo(
        () => (pages || []).find((candidate) => candidate.id === pageId) || null,
        [pages, pageId]
    );

    const startPage = useMemo(
        () => (startPages || []).find((candidate) => candidate.structurePageId === pageId) || null,
        [startPages, pageId]
    );

    const originOf = useMemo(
        () => createProductOrigin({catalogs, pages, startPages}),
        [catalogs, pages, startPages]
    );

    const pageIds = useMemo(
        () => storefrontList(startPages, pages, botType).map((item) => item.id),
        [startPages, pages, botType]
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
            scopeId: pageId,
            limit: config.heroSize
        }),
        [banners, mainPageProducts, originOf, originByPage, pageIds, pageId, config.heroSize]
    );

    const shelves = useMemo(
        () => buildShelves({structureBlocks, catalogs, mainPageProducts, originOf, pageIds, scopeId: pageId}),
        [structureBlocks, catalogs, mainPageProducts, originOf, pageIds, pageId]
    );

    const openProduct = useCallback((product) => {
        navigate(productRoute(product, catalogs) || `/card/${product.id}`);
    }, [catalogs, navigate]);

    const picker = useOfferPicker({originOf});
    const openOffer = picker.open;

    const openHero = useOpenHero();

    const openCatalog = useCallback((target) => {
        setPageId(target.pageId);
        navigate(catalogRoute(target.path));
    }, [navigate, setPageId]);

    useScrollMemory(`main:${pageId}`, {ready: shelves !== null});

    return (
        <div className={style.screen}>
            <OfferSplit offer={picker.picked} onPick={picker.pick} onClose={picker.close}/>

            <header className={style.head}>
                <h1 className={style.title}>{regionLabel(page, startPage)}</h1>
                <p className={style.subtitle}>{config.pageSubtitle}</p>
            </header>

            <StorefrontHero items={hero} onOpen={openHero}/>

            {shelves !== null && shelves.length === 0 ? (
                <EmptyState title="Витрина пустует" text="Полки этой площадки пока не заполнены"/>
            ) : null}

            {(shelves || []).map((shelf) => (
                <Shelf
                    key={shelf.key}
                    shelf={shelf}
                    size={config.shelfSize}
                    showOrigin={false}
                    onOpen={openOffer}
                    onOpenCatalog={openCatalog}
                />
            ))}
        </div>
    );
}
