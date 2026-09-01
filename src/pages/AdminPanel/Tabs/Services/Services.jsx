import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import WorkTabs, {useWorkTabs} from '../../Elements/WorkTabs/WorkTabs';
import {useFeedback} from '../../Elements/Feedback/Feedback';
import {useServer} from './useServer';
import BrandForm from './BrandForm';
import OfferForm from './OfferForm';
import PlanMatrix from './PlanMatrix';
import {brandStock, isFromCatalog, isManual, kindName, money} from './serviceModel';
import s from './Services.module.scss';

const ServicesList = ({onCountChange}) => {
    const server = useServer();
    const serverRef = useRef(server);
    serverRef.current = server;

    const {openTab, closeTab, updateTab} = useWorkTabs();
    const {showToast} = useFeedback();

    const [brands, setBrands] = useState(null);
    const [loading, setLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(() => new Set());

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
            subtitle: brand ? `${brand.offers?.length || 0} номиналов` : 'Создание',
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

    const openMatrix = useCallback((brand) => {
        const id = `service-matrix-${brand.id}`;

        openTab({
            id,
            title: `${brand.name} · сетка`,
            subtitle: 'Тарифы и периоды',
            entity: 'service-matrix',
            entityId: brand.id,
            content: (
                <PlanMatrix
                    brandId={brand.id}
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
                subtitle: `${brand.offers?.length || 0} номиналов`,
            });

            (brand.offers || []).forEach((offer) => updateTab(`service-offer-${offer.id}`, {
                title: `${brand.name} · ${offer.denomination}`,
                subtitle: `${offer.regionName} · ${money(offer.price)}`,
            }));
        });
    }, [brands, updateTab]);

    const toggle = (brandId) => setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(brandId)) next.delete(brandId);
        else next.add(brandId);
        return next;
    });

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
                    и другому покупателю не достанется. Подписки чаще оформляет менеджер: склад им не
                    нужен, после оплаты уведомление уходит человеку. Целую сетку «тариф × период»
                    удобнее завести кнопкой «Сетка», а не по одной позиции.
                </p>

                <div className={s['toolbar']}>
                    <button type="button" className={`${s['btn']} ${s['btnPrimary']}`}
                            onClick={() => openBrand(null)}>
                        Создать бренд
                    </button>
                    <button type="button" className={s['btn']} onClick={load}>Обновить</button>
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
                ) : (brands || []).map((brand) => {
                    const stock = brandStock(brand);
                    const isOpen = !collapsed.has(brand.id);

                    return (
                        <section key={brand.id} className={s['brand']}>
                            <div className={s['brandHead']}>
                                <button type="button" className={s['brandToggle']}
                                        aria-expanded={isOpen}
                                        onClick={() => toggle(brand.id)}>
                                    <span className={`${s['chevron']} ${isOpen ? s['chevronOpen'] : ''}`}>›</span>
                                    {brand.icon
                                        ? <img className={s['brandIcon']} src={brand.icon} alt=""/>
                                        : <span className={s['brandGlyph']}>{brand.glyph}</span>}
                                    <span className={s['brandName']}>{brand.name}</span>
                                    {brand.isHidden ? (
                                        <span className={`${s['badge']} ${s['badgeMuted']}`}>скрыт</span>
                                    ) : null}
                                    {brand.catalogId ? (
                                        <span className={`${s['badge']} ${s['badgeLink']}`}>
                                            каталог #{brand.catalogId}
                                        </span>
                                    ) : null}
                                </button>

                                <span className={s['brandStock']}>
                                    <span className={`${s['badge']} ${s['stockFree']}`}>{stock.available} свободно</span>
                                    {stock.reserved > 0 ? (
                                        <span className={`${s['badge']} ${s['stockHeld']}`}>{stock.reserved} бронь</span>
                                    ) : null}
                                    <span className={s['mono']}>{stock.sold} продано</span>
                                </span>

                                <span className={s['brandActions']}>
                                    <button type="button" className={s['btn']}
                                            onClick={() => openMatrix(brand)}>
                                        Сетка
                                    </button>
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
                                    {(brand.offers || []).length === 0 ? (
                                        <p className={s['emptyRow']}>
                                            У бренда нет номиналов — покупателю он не показывается.
                                        </p>
                                    ) : (
                                        <table className={s['table']}>
                                            <thead>
                                                <tr>
                                                    <th>Номинал</th>
                                                    <th className={s['groupCol']}>Тариф</th>
                                                    <th className={s['kindCol']}>Тип</th>
                                                    <th className={s['regionCol']}>Регион</th>
                                                    <th className={s['priceCol']}>Цена</th>
                                                    <th className={s['stockCol']}>Склад</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(brand.offers || []).map((offer) => (
                                                    <tr key={offer.id}
                                                        className={isFromCatalog(offer) ? s['rowLinked'] : ''}
                                                        onClick={() => (isFromCatalog(offer)
                                                            ? undefined
                                                            : openOffer(offer, brand))}>
                                                        <td className={s['nameCell']}>
                                                            {offer.denomination}
                                                            {offer.isHidden ? (
                                                                <span className={`${s['badge']} ${s['badgeMuted']}`}>
                                                                    скрыт
                                                                </span>
                                                            ) : null}
                                                            {isFromCatalog(offer) ? (
                                                                <span className={`${s['badge']} ${s['badgeLink']}`}>
                                                                    из каталога
                                                                </span>
                                                            ) : null}
                                                        </td>
                                                        <td className={s['groupCol']}>{offer.groupName || '—'}</td>
                                                        <td className={s['kindCol']}>{kindName(offer.kind)}</td>
                                                        <td className={s['regionCol']}>
                                                            {offer.regionIcon
                                                                ? <img className={s['regionIcon']}
                                                                       src={offer.regionIcon} alt=""/>
                                                                : (offer.regionFlag ? `${offer.regionFlag} ` : '')}
                                                            {offer.regionName}
                                                        </td>
                                                        <td className={s['priceCol']}>
                                                            <span className={s['price']}>{money(offer.price)}</span>
                                                            {offer.oldPrice ? (
                                                                <span className={s['oldPrice']}>
                                                                    {money(offer.oldPrice)}
                                                                </span>
                                                            ) : null}
                                                        </td>
                                                        <td className={s['stockCol']}>
                                                            {isManual(offer) || isFromCatalog(offer) ? (
                                                                <span className={`${s['badge']} ${s['badgeManual']}`}>
                                                                    менеджер
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    <span className={`${s['badge']} ${
                                                                        (offer.stock?.available || 0) > 0
                                                                            ? s['stockFree']
                                                                            : s['stockEmpty']
                                                                    }`}>
                                                                        {offer.stock?.available || 0}
                                                                    </span>
                                                                    {(offer.stock?.reserved || 0) > 0 ? (
                                                                        <span className={`${s['badge']} ${s['stockHeld']}`}>
                                                                            {offer.stock.reserved}
                                                                        </span>
                                                                    ) : null}
                                                                    <span className={s['mono']}>
                                                                        {offer.stock?.sold || 0}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
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
