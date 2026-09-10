import React, {useCallback, useMemo, useState} from 'react';
import {IconButton} from '../../ui';
import {useResource} from '../../platform/useResource';
import {keys} from '../../platform/resources';
import BannerCarousel from '../../../Main/BannerCarousel';
import CatalogSection from '../../../Main/CatalogSection';
import {buildSections} from '../../../Main/catalogSections';
import {fetchCatalogs, fetchPreviewCards} from './api';
import style from './StorefrontScreen.module.scss';

const STORAGE_KEY = 'admin2.storefront.preview';

const readCollapsed = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'collapsed';
    } catch {
        return false;
    }
};

const asList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.items)) return payload.items;

    return [];
};

export default function StorefrontPreview({page, blocks, banners = []}) {
    const [collapsed, setCollapsed] = useState(readCollapsed);

    const catalogs = useResource(keys.catalogList, fetchCatalogs, {enabled: !collapsed});
    const products = useResource(keys.previewCards, fetchPreviewCards, {enabled: !collapsed});

    const sections = useMemo(() => buildSections({
        structureBlocks: blocks,
        catalogs: asList(catalogs.data),
        mainPageProducts: asList(products.data),
        pageId: page?.id ?? null
    }), [blocks, catalogs.data, products.data, page]);

    const toggle = useCallback(() => {
        setCollapsed((value) => {
            const next = !value;

            try {
                localStorage.setItem(STORAGE_KEY, next ? 'collapsed' : 'open');
            } catch {
                return next;
            }

            return next;
        });
    }, []);

    if (collapsed) {
        return (
            <aside className={`${style.preview} ${style.previewCollapsed}`}>
                <IconButton label="Показать предпросмотр" onClick={toggle}>‹</IconButton>
                <span className={style.previewVertical}>Предпросмотр</span>
            </aside>
        );
    }

    return (
        <aside className={style.preview}>
            <header className={style.previewHead}>
                <span className={style.previewTitle}>Как увидит покупатель</span>
                <IconButton label="Свернуть предпросмотр" onClick={toggle}>›</IconButton>
            </header>

            <div className={style.previewBody}>
                {!page ? (
                    <p className={style.previewEmpty}>Выберите страницу слева</p>
                ) : (sections === null || sections.length === 0) && banners.length === 0 ? (
                    <p className={style.previewEmpty}>
                        Пока показывать нечего: у блоков нет каталогов с товарами.
                    </p>
                ) : (
                    <div className={style.phone}>
                        <div className={style.phoneScreen}>
                            {banners.length ? <BannerCarousel items={banners}/> : null}
                            {(sections || []).map((section) => (
                                <CatalogSection
                                    key={section.block.id}
                                    section={section}
                                    onOpenCatalog={() => undefined}
                                    onOpenSubscriptionCatalog={() => undefined}
                                    onOpenProduct={() => undefined}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
