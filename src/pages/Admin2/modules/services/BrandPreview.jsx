import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {IconButton} from '../../ui';
import style from './BrandPreview.module.scss';

const STORAGE_KEY = 'admin2.services.preview';

const KIND_TITLES = {
    gift_card: 'Гифт-карта',
    subscription: 'Подписка',
};

const money = (value) => `${new Intl.NumberFormat('ru-RU').format(Number(value) || 0)} ₽`;

const readCollapsed = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'collapsed';
    } catch {
        return false;
    }
};

const uniq = (list) => [...new Set(list)];

export default function BrandPreview({brand}) {
    const [collapsed, setCollapsed] = useState(readCollapsed);
    const [kind, setKind] = useState(null);
    const [region, setRegion] = useState(null);
    const [group, setGroup] = useState(null);
    const [offerId, setOfferId] = useState(null);

    const visible = useMemo(
        () => (brand.offers || []).filter((offer) => !offer.isHidden),
        [brand.offers],
    );

    const kinds = useMemo(() => uniq(visible.map((offer) => offer.kind || 'gift_card')), [visible]);
    const activeKind = kinds.includes(kind) ? kind : kinds[0] || null;

    const byKind = useMemo(
        () => visible.filter((offer) => (offer.kind || 'gift_card') === activeKind),
        [visible, activeKind],
    );

    const regions = useMemo(() => uniq(byKind.map((offer) => offer.regionName || 'Россия')), [byKind]);
    const activeRegion = regions.includes(region) ? region : regions[0] || null;

    const byRegion = useMemo(
        () => byKind.filter((offer) => (offer.regionName || 'Россия') === activeRegion),
        [byKind, activeRegion],
    );

    const groups = useMemo(
        () => uniq(byRegion.map((offer) => offer.groupName || '')).filter(Boolean),
        [byRegion],
    );
    const activeGroup = groups.includes(group) ? group : groups[0] || null;

    const offers = useMemo(
        () => byRegion.filter((offer) => (activeGroup ? offer.groupName === activeGroup : true)),
        [byRegion, activeGroup],
    );

    const active = offers.find((offer) => offer.id === offerId) || offers[0] || null;

    useEffect(() => {
        setOfferId(null);
    }, [brand.id, activeKind, activeRegion, activeGroup]);

    const toggle = useCallback(() => {
        setCollapsed((current) => {
            const next = !current;
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
            <aside className={`${style.preview} ${style.collapsed}`}>
                <IconButton label="Показать предпросмотр" onClick={toggle}>‹</IconButton>
                <span className={style.vertical}>Предпросмотр</span>
            </aside>
        );
    }

    return (
        <aside className={style.preview} style={{'--brand': brand.accent || 'var(--a2-accent)'}}>
            <header className={style.head}>
                <span className={style.headTitle}>Предпросмотр витрины</span>
                <IconButton label="Свернуть предпросмотр" onClick={toggle}>›</IconButton>
            </header>

            <div className={style.body}>
                <div className={style.phone}>
                    <div className={style.hero}>
                        <span className={style.heroTint}/>

                        <div className={style.heroTop}>
                            {brand.icon
                                ? <img className={style.heroIcon} src={brand.icon} alt=""/>
                                : <span className={style.heroGlyph}>{brand.glyph || '🎁'}</span>}

                            <div className={style.heroTitles}>
                                <span className={style.heroKind}>{KIND_TITLES[activeKind] || 'Товар'}</span>
                                <span className={style.heroName}>{brand.name}</span>
                            </div>
                        </div>

                        <div className={style.heroBottom}>
                            <div className={style.heroDenom}>
                                <span className={style.heroLabel}>Номинал</span>
                                <span className={style.heroValue}>{active?.denomination || '—'}</span>
                            </div>
                            <span className={style.heroRegion}>
                                {active?.regionFlag ? `${active.regionFlag} ` : ''}{activeRegion || '—'}
                            </span>
                        </div>
                    </div>

                    {kinds.length > 1 ? (
                        <section className={style.block}>
                            <span className={style.blockTitle}>Тип товара</span>
                            <div className={style.chips}>
                                {kinds.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className={`${style.chip} ${item === activeKind ? style.chipOn : ''}`}
                                        onClick={() => setKind(item)}
                                    >
                                        {KIND_TITLES[item] || item}
                                    </button>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {regions.length > 1 ? (
                        <section className={style.block}>
                            <span className={style.blockTitle}>Регион</span>
                            <div className={style.chips}>
                                {regions.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className={`${style.chip} ${item === activeRegion ? style.chipOn : ''}`}
                                        onClick={() => setRegion(item)}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {groups.length ? (
                        <section className={style.block}>
                            <span className={style.blockTitle}>{brand.groupLabel || 'Тариф'}</span>
                            <div className={style.chips}>
                                {groups.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className={`${style.chip} ${item === activeGroup ? style.chipOn : ''}`}
                                        onClick={() => setGroup(item)}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    <section className={style.block}>
                        <span className={style.blockTitle}>Номинал</span>

                        {offers.length ? (
                            <div className={style.offers}>
                                {offers.map((offer) => (
                                    <button
                                        key={offer.id}
                                        type="button"
                                        className={`${style.offer} ${offer.id === active?.id ? style.offerOn : ''}`}
                                        onClick={() => setOfferId(offer.id)}
                                    >
                                        <span className={style.offerName}>{offer.denomination}</span>
                                        <span className={style.offerPrices}>
                                            <span className={style.offerPrice}>{money(offer.price)}</span>
                                            {offer.oldPrice ? (
                                                <span className={style.offerOld}>{money(offer.oldPrice)}</span>
                                            ) : null}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <span className={style.empty}>
                                Показывать нечего: у бренда нет видимых предложений.
                            </span>
                        )}
                    </section>

                    {brand.activationNote ? (
                        <section className={style.block}>
                            <span className={style.blockTitle}>Активация</span>
                            <span className={style.note}>{brand.activationNote}</span>
                        </section>
                    ) : null}

                    {active?.fulfillment === 'manual' && brand.deliveryNote ? (
                        <section className={style.block}>
                            <span className={style.blockTitle}>Доставка</span>
                            <span className={style.note}>{brand.deliveryNote}</span>
                        </section>
                    ) : null}

                    <div className={style.total}>
                        <span className={style.totalLabel}>К оплате</span>
                        <span className={style.totalValue}>{active ? money(active.price) : '—'}</span>
                    </div>
                </div>

                <span className={style.hint}>
                    Так бренд выглядит у покупателя. Кнопка оплаты в предпросмотре убрана.
                </span>
            </div>
        </aside>
    );
}
