import React, {useCallback, useMemo, useState} from 'react';
import {IconButton} from '../../ui';
import ServicesView from '../../../Services/ServicesView';
import {resolveSelection} from '../../../Services/servicesModel';
import style from './BrandPreview.module.scss';

const STORAGE_KEY = 'admin2.services.preview';

const readCollapsed = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'collapsed';
    } catch {
        return false;
    }
};

const toStorefrontOffer = (offer) => {
    const fulfillment = offer.fulfillment || 'code';

    return {
        id: offer.id,
        productId: offer.productId ?? null,
        kind: offer.kind,
        groupName: offer.groupName || null,
        regionName: offer.regionName,
        regionIcon: offer.regionIcon,
        regionFlag: offer.regionFlag,
        denomination: offer.denomination,
        price: offer.price,
        oldPrice: offer.oldPrice,
        fulfillment,
        stock: fulfillment === 'manual' ? null : (offer.stock?.available ?? Number(offer.stock) ?? 0),
    };
};

const toStorefront = (brands, keepId) => (brands || [])
    .filter((brand) => !brand.isHidden || String(brand.id) === String(keepId))
    .map((brand) => ({
        id: brand.id,
        name: brand.name,
        icon: brand.icon,
        glyph: brand.glyph,
        accent: brand.accent,
        activationNote: brand.activationNote,
        deliveryNote: brand.deliveryNote,
        groupLabel: brand.groupLabel,
        offers: (brand.offers || []).filter((offer) => !offer.isHidden).map(toStorefrontOffer),
    }))
    .filter((brand) => brand.offers.length || String(brand.id) === String(keepId));

export default function BrandPreview({brands, brandId, onOpenBrand}) {
    const [collapsed, setCollapsed] = useState(readCollapsed);
    const [kind, setKind] = useState(null);
    const [regionName, setRegionName] = useState(null);
    const [groupName, setGroupName] = useState(null);
    const [offerId, setOfferId] = useState(null);
    const [email, setEmail] = useState('');

    const storefront = useMemo(() => toStorefront(brands, brandId), [brands, brandId]);

    const current = useMemo(
        () => storefront.find((brand) => String(brand.id) === String(brandId))?.id ?? null,
        [storefront, brandId],
    );

    const view = useMemo(
        () => resolveSelection(storefront, {brandId: current, kind, regionName, groupName, offerId}),
        [storefront, current, kind, regionName, groupName, offerId],
    );

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

    const pickBrand = useCallback((item) => {
        setKind(null);
        setRegionName(null);
        setGroupName(null);
        setOfferId(null);
        onOpenBrand?.(item.id);
    }, [onOpenBrand]);

    const pickKind = useCallback((value) => {
        setKind(value);
        setRegionName(null);
        setGroupName(null);
        setOfferId(null);
    }, []);

    const pickRegion = useCallback((value) => {
        setRegionName(value);
        setGroupName(null);
        setOfferId(null);
    }, []);

    const pickGroup = useCallback((value) => {
        setGroupName(value);
        setOfferId(null);
    }, []);

    if (collapsed) {
        return (
            <aside className={`${style.preview} ${style.collapsed}`}>
                <IconButton label="Показать предпросмотр" onClick={toggle}>‹</IconButton>
                <span className={style.vertical}>Предпросмотр</span>
            </aside>
        );
    }

    return (
        <aside className={style.preview}>
            <header className={style.head}>
                <span className={style.headTitle}>Предпросмотр витрины</span>
                <IconButton label="Свернуть предпросмотр" onClick={toggle}>›</IconButton>
            </header>

            <div className={style.body}>
                <div className={style.phone}>
                    <div className={style.frame}>
                        <ServicesView
                            brands={storefront}
                            view={view}
                            email={email}
                            onEmailChange={setEmail}
                            onPickBrand={pickBrand}
                            onPickKind={pickKind}
                            onPickRegion={pickRegion}
                            onPickGroup={pickGroup}
                            onPickOffer={(item) => setOfferId(item.id)}
                        />
                    </div>
                </div>

                <span className={style.hint}>
                    Это настоящая страница «Сервисов» с текущими данными бренда. Кнопки оплаты в предпросмотре нет.
                </span>
            </div>
        </aside>
    );
}
