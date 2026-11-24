import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore, selectUserId} from '../../../store/useSessionStore';
import {useStructureStore} from '../../../store/useStructureStore';
import {useCartStore} from '../../../store/useCartStore';
import {createProductOrigin} from '../../../shared/lib/productOrigin';
import {productRoute} from '../../../shared/lib/pageRoutes';
import EmptyState from '../../../shared/ui/EmptyState/EmptyState';
import {discountPercent, shortPlatform, subscriptionTerm} from '../../../pages/Main/catalogSections';
import {money, pageCartItems, rupees, lira} from '../../../pages/Basket/cartModel';
import {unitOldPrice, unitPrice, unitRupees} from '../../../pages/Basket/quoteLocal';
import {useBasketQuote} from '../../../pages/Basket/useBasketQuote';
import {useTurkeyCodesMode} from '../../../shared/hooks/useTurkeyCodesMode';
import {usePromoMemory} from '../../../pages/Basket/usePromoMemory';
import {useRecommendations} from '../../../pages/Basket/useRecommendations';
import {usePendingOrder} from '../../../pages/Basket/usePendingOrder';
import {mergeOffers} from '../../model/storefrontModel';
import {useScrollMemory} from '../../shell/ScrollAreaContext';
import {useOfferPicker} from '../../shell/useOfferPicker';
import {Reveal} from '../../shell/useReveal';
import Cover from '../../ui/Cover';
import Spinner from '../../ui/Spinner';
import OfferCard from '../Storefront/OfferCard';
import OfferSplit from '../Storefront/OfferSplit';
import DesktopPromo from './DesktopPromo';
import style from './DesktopBasket.module.scss';

const RECOMMEND_LIMIT = 6;
const RECOMMEND_BATCH = RECOMMEND_LIMIT * 2;

function CartRow({item, regionTitle, foreignPrice, index, isLeaving, onOpen, onCount, onDrop}) {
    const price = unitPrice(item);
    const oldPrice = unitOldPrice(item);
    const percent = foreignPrice ? 0 : discountPercent(price, oldPrice);

    const meta = [subscriptionTerm(item), shortPlatform(item.platform), item.typeLabel, regionTitle]
        .filter(Boolean)
        .join(' · ');

    return (
        <article
            className={isLeaving ? `${style.row} ${style.rowLeaving}` : style.row}
            style={{'--i': index}}
            onAnimationEnd={isLeaving ? (event) => onDrop(event, item) : undefined}
        >
            <Cover src={item.image} className={style.rowCover} onClick={() => onOpen(item)}/>

            <div className={style.rowBody}>
                <span className={style.rowName} onClick={() => onOpen(item)}>{item.name}</span>
                {meta ? <span className={style.rowMeta}>{meta}</span> : null}

                <div className={style.counter}>
                    <button
                        type="button"
                        className={style.counterButton}
                        aria-label={item.count > 1 ? 'Убрать одну штуку' : 'Убрать из корзины'}
                        onClick={() => onCount(item, item.count - 1)}
                    >
                        −
                    </button>

                    <span key={item.count} className={style.counterValue}>{item.count}</span>

                    <button
                        type="button"
                        className={style.counterButton}
                        aria-label="Добавить ещё одну штуку"
                        onClick={() => onCount(item, item.count + 1)}
                    >
                        +
                    </button>
                </div>
            </div>

            <div className={style.rowPrices}>
                <span key={price} className={style.rowPrice}>
                    {foreignPrice ? foreignPrice(unitRupees(item)) : money(price)}
                </span>
                {percent > 0 ? <span className={style.rowOldPrice}>{money(oldPrice)}</span> : null}

                <button
                    type="button"
                    className={style.rowDrop}
                    aria-label="Убрать из корзины"
                    onClick={() => onCount(item, 0)}
                >
                    Убрать
                </button>
            </div>
        </article>
    );
}

function TopupSummary({calc}) {
    if (!calc || (calc.mode !== 'ps_india' && calc.mode !== 'ps_turkey_codes')) return null;

    const isTurkey = calc.mode === 'ps_turkey_codes';
    const format = isTurkey ? lira : rupees;
    const total = isTurkey ? calc.tryTotal : calc.rsTotal;
    const rounded = isTurkey ? calc.tryRounded : calc.rsRounded;
    const leftover = isTurkey ? calc.leftoverTry : calc.leftoverRs;

    return (
        <div className={style.india}>
            <span className={style.indiaTitle}>Пополнение баланса PSN</span>

            <div className={style.indiaRow}>
                <span>Стоимость товаров</span>
                <span className={style.indiaValue}>{format(total)}</span>
            </div>

            <div className={style.indiaRow}>
                <span>{isTurkey ? 'Пополним баланс кодами' : 'Пополним баланс, кратно 1000'}</span>
                <span className={style.indiaAccent}>{format(rounded)}</span>
            </div>

            <div className={style.indiaRow}>
                <span>Пополнение в рублях</span>
                <span className={style.indiaValue}>{money(calc.topupRub)}</span>
            </div>

            <span className={style.indiaNote}>
                {leftover > 0
                    ? `Остаток ${format(leftover)} сохранится на аккаунте и уйдёт в счёт следующей покупки.`
                    : 'Сумма спишется ровно под расчёт, без остатка.'}
                {isTurkey ? ' Коды пополнения придут автоматически сразу после оплаты.' : ''}
            </span>
        </div>
    );
}

function FulfillmentOption({active, label, price, note, onClick}) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            className={`${style.fulfillmentOption} ${active ? style.fulfillmentOptionActive : ''}`}
            onClick={onClick}
        >
            <span className={style.fulfillmentLabel}>{label}</span>
            {price !== null && price !== undefined ? (
                <span key={price} className={style.fulfillmentPrice}>{money(price)}</span>
            ) : null}
            <span className={style.fulfillmentHint}>{note}</span>
        </button>
    );
}

function FulfillmentSwitch({isCodes, onChange, managerPrice, codesPrice}) {
    return (
        <div className={style.fulfillment}>
            <div className={style.fulfillmentHead}>
                <span className={style.fulfillmentTitle}>Способ активации</span>
                <span key={isCodes ? 'codes' : 'manager'} className={style.fulfillmentBadge}>
                    {isCodes ? 'Мгновенно' : 'Вручную'}
                </span>
            </div>

            <div className={style.fulfillmentTrack} role="tablist">
                <span
                    className={`${style.fulfillmentPill} ${isCodes ? style.fulfillmentPillCodes : ''}`}
                    aria-hidden="true"
                />
                <FulfillmentOption
                    active={!isCodes}
                    label="Со входом в аккаунт"
                    price={managerPrice}
                    note="пополнит на аккаунте"
                    onClick={() => onChange(false)}
                />
                <FulfillmentOption
                    active={isCodes}
                    label="Без входа в аккаунт"
                    price={codesPrice}
                    note="автоматически"
                    onClick={() => onChange(true)}
                />
            </div>

            <span key={isCodes ? 'codes' : 'manager'} className={style.fulfillmentNote}>
                {isCodes
                    ? 'Коды пополнения PSN придут автоматически сразу после оплаты.'
                    : 'Менеджер пополнит баланс на вашем аккаунте после оплаты.'}
            </span>
        </div>
    );
}

export default function DesktopBasket() {
    const navigate = useNavigate();

    const userId = useSessionStore(selectUserId);
    const pageId = useSessionStore((state) => state.pageId);
    const pages = useStructureStore((state) => state.pages);
    const startPages = useStructureStore((state) => state.startPages);
    const catalogs = useStructureStore((state) => state.catalogs);

    const items = useCartStore((state) => state.items);
    const loadCart = useCartStore((state) => state.load);
    const setCartCount = useCartStore((state) => state.setCount);

    const [leavingId, setLeavingId] = useState(null);

    const pending = usePendingOrder(userId);
    const recommendations = useRecommendations(pageId, RECOMMEND_BATCH);

    const page = useMemo(() => (pages || []).find((item) => item.id === pageId) || null, [pages, pageId]);
    const regionTitle = page?.name || null;
    const pageType = pages ? (page?.type || null) : undefined;
    const isIndia = pageType === 'ps_india';
    const [turkeyCodes, setTurkeyCodes, turkeyMethods] = useTurkeyCodesMode();
    const isTurkeyCodes = pageType === 'ps' && turkeyCodes;

    const pageItems = useMemo(
        () => pageCartItems(items, catalogs, pageId),
        [items, catalogs, pageId]
    );

    const hasTryItems = pageType === 'ps' && (pageItems || []).some((item) => unitRupees(item));

    const {promo, apply, clear} = usePromoMemory();
    const {quote, isLoading, error, retry} = useBasketQuote({
        items: pageItems,
        pageType,
        promo,
        forceServer: hasTryItems,
        fulfillment: isTurkeyCodes ? 'codes' : null
    });
    const showFulfillmentSwitch = hasTryItems && turkeyMethods.manager && turkeyMethods.codes;

    const originOf = useMemo(
        () => createProductOrigin({catalogs, pages, startPages}),
        [catalogs, pages, startPages]
    );

    const offers = useMemo(
        () => mergeOffers(recommendations || [], originOf),
        [recommendations, originOf]
    );

    const picker = useOfferPicker({originOf});

    useScrollMemory('basket', {ready: pageItems !== null});

    useEffect(() => {
        loadCart(userId);
    }, [userId, loadCart]);

    const openProduct = useCallback((product) => {
        navigate(productRoute(product, catalogs) || `/card/${product.id}`);
    }, [catalogs, navigate]);

    const changeCount = useCallback((item, next) => {
        if (next < 1) {
            setLeavingId(item.id);
            return;
        }

        setCartCount(userId, item.id, next);
    }, [setCartCount, userId]);

    const dropLeaving = useCallback((event, item) => {
        if (event.target !== event.currentTarget) return;

        setLeavingId(null);
        setCartCount(userId, item.id, 0);
    }, [setCartCount, userId]);

    const goToCheckout = useCallback(() => navigate('/checkout'), [navigate]);

    const count = pageItems?.length ?? 0;
    const isEmpty = pageItems !== null && count === 0;
    const total = quote?.total ?? 0;

    return (
        <div className={style.screen}>
            <OfferSplit offer={picker.picked} onPick={picker.pick} onClose={picker.close}/>

            <header className={style.head}>
                <h1 className={style.title}>Ваша корзина</h1>
                {count > 0 ? <span className={style.headCount}>{count} в заказе</span> : null}
            </header>

            {pending ? (
                <button type="button" className={style.pending} onClick={goToCheckout}>
                    <span className={style.pendingDot} aria-hidden="true"/>
                    <span className={style.pendingBody}>
                        <span className={style.pendingTitle}>Заказ №{pending.id} ждёт оплаты</span>
                        <span className={style.pendingNote}>{money(pending.total)} — продолжить оплату</span>
                    </span>
                    <span className={style.pendingArrow} aria-hidden="true">→</span>
                </button>
            ) : null}

            {pageItems === null ? (
                <div className={style.body}>
                    <div className={style.list}>
                        <div className={style.skeletonRow}/>
                        <div className={style.skeletonRow}/>
                        <div className={style.skeletonRow}/>
                    </div>
                    <div className={style.skeletonPanel}/>
                </div>
            ) : isEmpty ? (
                <EmptyState
                    icon="🛒"
                    title="В корзине пусто"
                    text="Добавьте игру, подписку или донат — соберём заказ и оформим за пару минут."
                    actionLabel="Перейти к покупкам"
                    onAction={() => navigate('/')}
                />
            ) : (
                <div className={style.body}>
                    <div className={style.list}>
                        {pageItems.map((item, index) => (
                            <CartRow
                                key={item.id}
                                item={item}
                                index={index}
                                regionTitle={regionTitle}
                                foreignPrice={(isIndia || isTurkeyCodes) && unitRupees(item)
                                    ? (isTurkeyCodes ? lira : rupees)
                                    : null}
                                isLeaving={leavingId === item.id}
                                onOpen={openProduct}
                                onCount={changeCount}
                                onDrop={dropLeaving}
                            />
                        ))}
                    </div>

                    <aside className={isLoading ? `${style.panel} ${style.panelPending}` : style.panel}>
                        <span className={style.panelTitle}>Ваш заказ</span>

                        {showFulfillmentSwitch ? (
                            <FulfillmentSwitch
                                isCodes={isTurkeyCodes}
                                onChange={setTurkeyCodes}
                                managerPrice={quote?.modes?.manager?.total ?? null}
                                codesPrice={quote?.modes?.codes?.total ?? null}
                            />
                        ) : null}

                        <DesktopPromo promo={quote?.promo || null} onApply={apply} onClear={clear}/>

                        <TopupSummary calc={quote?.calc}/>

                        {error ? (
                            <button type="button" className={style.retry} onClick={retry}>
                                Не удалось посчитать сумму. Повторить
                            </button>
                        ) : (
                            <>
                                <div className={style.totalsRow}>
                                    <span className={style.totalsLabel}>
                                        {isIndia || isTurkeyCodes ? 'Пополнение и подписки' : `Товары (${count})`}
                                    </span>
                                    <span key={quote?.itemsTotal} className={style.totalsValue}>
                                        {money(quote?.itemsTotal ?? 0)}
                                    </span>
                                </div>

                                {quote?.discount > 0 ? (
                                    <div className={style.totalsRow}>
                                        <span className={style.totalsLabel}>Скидка по промокоду</span>
                                        <span className={style.totalsDiscount}>−{money(quote.discount)}</span>
                                    </div>
                                ) : null}

                                <span className={style.divider} aria-hidden="true"/>

                                <div className={style.totalsRow}>
                                    <span className={style.finalLabel}>Итого</span>
                                    <span key={total} className={style.finalValue}>{money(total)}</span>
                                </div>
                            </>
                        )}

                        <button
                            type="button"
                            className={style.primary}
                            disabled={isLoading || Boolean(error) || total <= 0}
                            onClick={goToCheckout}
                        >
                            {isLoading ? <Spinner/> : null}
                            {isLoading ? 'Считаем сумму…' : 'Оформить заказ'}
                        </button>

                        <span className={style.panelNote}>
                            Оплата картой, СБП или частями — выберете на следующем шаге
                        </span>
                    </aside>
                </div>
            )}

            {offers.length ? (
                <Reveal as="section" className={style.recommend}>
                    <h2 className={style.recommendTitle}>Может быть интересно</h2>

                    <div className={style.recommendGrid}>
                        {offers.slice(0, RECOMMEND_LIMIT).map((offer, index) => (
                            <OfferCard
                                key={offer.key}
                                offer={offer}
                                index={index}
                                showOrigin={false}
                                onOpen={picker.open}
                            />
                        ))}
                    </div>
                </Reveal>
            ) : null}
        </div>
    );
}
