import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import WorkTabs, {useWorkTabs} from '../../Elements/WorkTabs/WorkTabs';
import {useFeedback} from '../../Elements/Feedback/Feedback';
import {useServer} from './useServer';
import BrandForm from './BrandForm';
import OfferForm from './OfferForm';
import {brandStock, kindName, money} from './serviceModel';
import s from './Services.module.scss';

const plural = (count, forms) => {
    const tail = Math.abs(count) % 100;
    const last = tail % 10;
    if (tail > 10 && tail < 20) return forms[2];
    if (last > 1 && last < 5) return forms[1];
    if (last === 1) return forms[0];
    return forms[2];
};

const offerWord = (count) => `${count} ${plural(count, ['номинал', 'номинала', 'номиналов'])}`;

const norm = (value) => String(value ?? '').toLowerCase();

const groupByRegion = (offers) => {
    const groups = new Map();

    offers.forEach((offer) => {
        const key = offer.regionName || '—';
        if (!groups.has(key)) {
            groups.set(key, {
                key,
                name: key,
                icon: offer.regionIcon,
                flag: offer.regionFlag,
                items: [],
            });
        }
        groups.get(key).items.push(offer);
    });

    return [...groups.values()];
};

const RegionMark = ({icon, flag}) => {
    if (icon) return <img className={s['regionIcon']} src={icon} alt=""/>;
    return <span className={s['regionFlag']}>{flag || '·'}</span>;
};

const ServicesList = ({onCountChange}) => {
    const server = useServer();
    const serverRef = useRef(server);
    serverRef.current = server;

    const {openTab, closeTab, updateTab} = useWorkTabs();
    const {showToast} = useFeedback();

    const [brands, setBrands] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(() => new Set());
    const [query, setQuery] = useState('');

    const treeRef = useRef([]);
    treeRef.current = brands || [];

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await serverRef.current.getServiceTree();
            setBrands(result);
        } catch (error) {
            showToast(error.message || 'Не удалось загрузить витрину «Сервисы»', 'error');
            setBrands([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { load(); }, [load]);

    const totals = useMemo(() => (brands || []).reduce((sum, brand) => {
        const stock = brandStock(brand);
        return {
            brands: sum.brands + 1,
            offers: sum.offers + (brand.offers?.length || 0),
            available: sum.available + stock.available,
        };
    }, {brands: 0, offers: 0, available: 0}), [brands]);

    useEffect(() => {
        if (loading) {
            onCountChange('Загрузка…');
            return;
        }
        onCountChange(`${totals.brands} брендов · ${totals.offers} номиналов · ${totals.available} кодов`);
    }, [loading, totals, onCountChange]);

    const findBrand = useCallback(
        (brandId) => treeRef.current.find((brand) => brand.id === brandId) || null,
        [],
    );

    const findOffer = useCallback(
        (offerId) => treeRef.current
            .flatMap((brand) => brand.offers || [])
            .find((offer) => offer.id === offerId) || null,
        [],
    );

    const openBrand = useCallback((brand) => {
        const id = brand ? `service-brand-${brand.id}` : 'service-brand-new';

        openTab({
            id,
            title: brand ? brand.name || `Бренд ${brand.id}` : 'Новый бренд',
            subtitle: brand ? offerWord(brand.offers?.length || 0) : 'Создание',
            entity: 'service-brand',
            entityId: brand?.id ?? -1,
            content: (
                <BrandForm
                    brandId={brand?.id ?? -1}
                    findBrand={findBrand}
                    onClose={() => closeTab(id)}
                    onSaved={load}
                />
            ),
        });
    }, [openTab, closeTab, findBrand, load]);

    const openOffer = useCallback((offer, brand) => {
        const id = offer ? `service-offer-${offer.id}` : `service-offer-new-${brand.id}`;

        openTab({
            id,
            title: offer ? `${brand.name} · ${offer.denomination}` : `${brand.name} · новый номинал`,
            subtitle: offer ? `${offer.regionName} · ${money(offer.price)}` : 'Создание',
            entity: 'service-offer',
            entityId: offer?.id ?? -1,
            content: (
                <OfferForm
                    offerId={offer?.id ?? -1}
                    brandId={brand.id}
                    findOffer={findOffer}
                    onClose={() => closeTab(id)}
                    onSaved={load}
                />
            ),
        });
    }, [openTab, closeTab, findOffer, load]);

    useEffect(() => {
        (brands || []).forEach((brand) => {
            updateTab(`service-brand-${brand.id}`, {
                title: brand.name || `Бренд ${brand.id}`,
                subtitle: offerWord(brand.offers?.length || 0),
            });

            (brand.offers || []).forEach((offer) => updateTab(`service-offer-${offer.id}`, {
                title: `${brand.name} · ${offer.denomination}`,
                subtitle: `${offer.regionName} · ${money(offer.price)}`,
            }));
        });
    }, [brands, updateTab]);

    const searching = query.trim().length > 0;

    const rows = useMemo(() => {
        const needle = norm(query.trim());

        return (brands || []).reduce((list, brand) => {
            const offers = brand.offers || [];
            const brandHit = Boolean(needle) && norm(brand.name).includes(needle);

            const visible = !needle || brandHit
                ? offers
                : offers.filter((offer) => norm(offer.denomination).includes(needle)
                    || norm(offer.regionName).includes(needle));

            if (needle && !brandHit && visible.length === 0) return list;

            list.push({
                brand,
                offers: visible,
                stock: brandStock(brand),
                regions: groupByRegion(visible),
            });

            return list;
        }, []);
    }, [brands, query]);

    const toggle = (brandId) => setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(brandId)) next.delete(brandId);
        else next.add(brandId);
        return next;
    });

    const allOpen = rows.length > 0 && rows.every(({brand}) => expanded.has(brand.id));

    const toggleAll = () => setExpanded(allOpen ? new Set() : new Set(rows.map(({brand}) => brand.id)));

    return (
        <div className={s['screen']}>
            <header className={s['header']}>
                <div className={s['headerTop']}>
                    <h1 className={s['title']}>Сервисы</h1>
                    <span className={s['counter']}>
                        {loading
                            ? 'Загрузка…'
                            : `${totals.brands} брендов · ${totals.offers} номиналов · ${totals.available} кодов`}
                    </span>
                </div>

                <p className={s['lead']}>
                    Коды и гифт-карты продаются со склада: покупатель платит — сервер сразу отдаёт ему
                    свободный код и помечает его проданным. Пока счёт не оплачен, код держится в брони
                    и другому покупателю не достанется.
                </p>

                <div className={s['toolbar']}>
                    <button type="button" className={`${s['btn']} ${s['btnPrimary']}`}
                            onClick={() => openBrand(null)}>
                        Создать бренд
                    </button>
                    <button type="button" className={s['btn']} onClick={load}>Обновить</button>

                    <div className={s['searchField']}>
                        <svg className={s['searchIcon']} viewBox="0 0 24 24" width="16" height="16"
                             fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <circle cx="11" cy="11" r="7"/>
                            <path d="m20 20-3.5-3.5" strokeLinecap="round"/>
                        </svg>
                        <input
                            className={s['searchInput']}
                            placeholder="Бренд, регион или номинал"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                        {query ? (
                            <button type="button" className={s['searchClear']}
                                    onClick={() => setQuery('')} aria-label="Очистить">
                                ✕
                            </button>
                        ) : null}
                    </div>

                    <button type="button" className={s['btn']} onClick={toggleAll} disabled={searching}>
                        {allOpen ? 'Свернуть всё' : 'Развернуть всё'}
                    </button>
                </div>
            </header>

            <div className={s['tree']}>
                {loading ? (
                    <p className={s['empty']}>Загрузка…</p>
                ) : (brands || []).length === 0 ? (
                    <p className={s['empty']}>
                        Брендов пока нет. Создайте первый — например, Steam, — а внутри заведите номиналы
                        и загрузите к ним коды.
                    </p>
                ) : rows.length === 0 ? (
                    <p className={s['empty']}>
                        По запросу «{query.trim()}» ничего не нашлось. Ищем по названию бренда,
                        региону и номиналу.
                    </p>
                ) : rows.map(({brand, offers, stock, regions}) => {
                    const total = brand.offers?.length || 0;
                    const isOpen = searching || expanded.has(brand.id);

                    return (
                        <section key={brand.id} className={s['brand']}>
                            <div className={s['brandHead']}>
                                <button type="button" className={s['brandToggle']}
                                        aria-expanded={isOpen}
                                        onClick={() => toggle(brand.id)}>
                                    <span className={`${s['chevron']} ${isOpen ? s['chevronOpen'] : ''}`}>›</span>
                                    <span className={s['brandMark']}>
                                        {brand.icon
                                            ? <img className={s['brandIcon']} src={brand.icon} alt=""/>
                                            : <span className={s['brandGlyph']}>{brand.glyph}</span>}
                                    </span>
                                    <span className={s['brandName']}>{brand.name}</span>
                                    <span className={s['brandCount']}>
                                        {searching && offers.length !== total
                                            ? `${offers.length} из ${total}`
                                            : offerWord(total)}
                                    </span>
                                    {brand.isHidden ? (
                                        <span className={`${s['badge']} ${s['badgeMuted']}`}>скрыт</span>
                                    ) : null}
                                    {total === 0 ? (
                                        <span className={`${s['badge']} ${s['badgeMuted']}`}>не в витрине</span>
                                    ) : null}
                                </button>

                                <span className={s['brandStock']}>
                                    <span className={`${s['badge']} ${
                                        stock.available > 0 ? s['stockFree'] : s['stockEmpty']
                                    }`}>
                                        {stock.available} свободно
                                    </span>
                                    {stock.reserved > 0 ? (
                                        <span className={`${s['badge']} ${s['stockHeld']}`}>
                                            {stock.reserved} бронь
                                        </span>
                                    ) : null}
                                    <span className={s['mono']}>{stock.sold} продано</span>
                                </span>

                                <span className={s['brandActions']}>
                                    <button type="button" className={s['btn']}
                                            onClick={() => openOffer(null, brand)}>
                                        Номинал
                                    </button>
                                    <button type="button" className={s['btn']}
                                            onClick={() => openBrand(brand)}>
                                        Настроить
                                    </button>
                                </span>
                            </div>

                            {isOpen ? (
                                <div className={s['offers']}>
                                    {offers.length === 0 ? (
                                        <p className={s['emptyRow']}>
                                            У бренда нет номиналов — покупателю он не показывается.
                                        </p>
                                    ) : regions.map((region) => (
                                        <div key={region.key} className={s['region']}>
                                            <div className={s['regionHead']}>
                                                <RegionMark icon={region.icon} flag={region.flag}/>
                                                <span className={s['regionName']}>{region.name}</span>
                                                <span className={s['regionCount']}>
                                                    {offerWord(region.items.length)}
                                                </span>
                                            </div>

                                            <div className={s['grid']}>
                                                {region.items.map((offer) => {
                                                    const available = offer.stock?.available || 0;
                                                    const reserved = offer.stock?.reserved || 0;

                                                    return (
                                                        <button
                                                            key={offer.id}
                                                            type="button"
                                                            className={`${s['card']} ${
                                                                offer.isHidden ? s['cardHidden'] : ''
                                                            }`}
                                                            onClick={() => openOffer(offer, brand)}
                                                        >
                                                            <span className={s['cardTop']}>
                                                                <span className={s['cardName']}>
                                                                    {offer.denomination}
                                                                </span>
                                                                <span className={s['cardPrice']}>
                                                                    {money(offer.price)}
                                                                </span>
                                                            </span>

                                                            <span className={s['cardBottom']}>
                                                                <span className={`${s['dot']} ${
                                                                    available > 0 ? s['dotFree'] : s['dotEmpty']
                                                                }`}/>
                                                                <span className={s['cardStock']}>
                                                                    {available > 0
                                                                        ? `${available} на складе`
                                                                        : 'нет кодов'}
                                                                </span>
                                                                {reserved > 0 ? (
                                                                    <span className={s['cardTag']}>
                                                                        {reserved} бронь
                                                                    </span>
                                                                ) : null}
                                                                {offer.oldPrice ? (
                                                                    <span className={s['oldPrice']}>
                                                                        {money(offer.oldPrice)}
                                                                    </span>
                                                                ) : null}
                                                                {offer.kind !== 'gift_card' ? (
                                                                    <span className={s['cardTag']}>
                                                                        {kindName(offer.kind)}
                                                                    </span>
                                                                ) : null}
                                                                {offer.isHidden ? (
                                                                    <span className={s['cardTag']}>скрыт</span>
                                                                ) : null}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </section>
                    );
                })}
            </div>
        </div>
    );
};

const Services = () => {
    const [subtitle, setSubtitle] = useState('');

    return (
        <WorkTabs rootTitle="Сервисы" rootSubtitle={subtitle}>
            <ServicesList onCountChange={setSubtitle}/>
        </WorkTabs>
    );
};

export default Services;
