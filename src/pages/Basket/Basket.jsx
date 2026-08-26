import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore, selectUserId} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {useCartStore} from '../../store/useCartStore';
import {useProductStore} from '../../store/useProductStore';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {useBackButton} from '../../shared/hooks/useBackButton';
import {useScrollMemory} from '../../shared/hooks/useScrollMemory';
import {hapticImpact, hapticSelection} from '../../shared/lib/haptic';
import {recallView, rememberView} from '../../shared/lib/viewMemory';
import BackPill from '../../shared/ui/BackPill/BackPill';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import ProductCard from '../Main/ProductCard';
import {fetchRecommendations} from '../../shared/api/product';
import {discountPercent, shortPlatform} from '../Main/catalogSections';
import {money, pageCartItems, rupees} from './cartModel';
import {useBasketQuote} from './useBasketQuote';
import {usePendingOrder} from './usePendingOrder';
import PromoField from './PromoField';
import style from './Basket.module.scss';

const PROMO_KEY = 'cart:promo';

function CartRow({item, regionTitle, isRupee, onOpen, onCount}) {
    const percent = isRupee ? 0 : discountPercent(item.price, item.oldPrice);
    const meta = [shortPlatform(item.platform), item.typeLabel, regionTitle].filter(Boolean).join(' · ');

    return (
        <article className={style.row}>
            <span
                className={style.cover}
                style={item.image ? {backgroundImage: `url(${item.image})`} : undefined}
                onClick={() => onOpen(item)}
            />

            <div className={style.rowBody}>
                <span className={style.rowName} onClick={() => onOpen(item)}>{item.name}</span>
                {meta ? <span className={style.rowMeta}>{meta}</span> : null}

                <div className={style.rowBottom}>
                    <div className={style.rowPrices}>
                        <span className={style.rowPrice}>
                            {isRupee ? rupees(item.priceInOtherCurrency) : money(item.price)}
                        </span>
                        {percent > 0 ? <span className={style.rowOldPrice}>{money(item.oldPrice)}</span> : null}
                    </div>

                    <div className={style.counter}>
                        <button
                            type="button"
                            className={style.counterButton}
                            aria-label={item.count > 1 ? 'Убрать одну штуку' : 'Убрать из корзины'}
                            onClick={() => onCount(item, item.count - 1)}
                        >
                            −
                        </button>

                        <span className={style.counterValue}>{item.count}</span>

                        <button
                            type="button"
                            className={`${style.counterButton} ${style.counterPlus}`}
                            aria-label="Добавить ещё одну штуку"
                            onClick={() => onCount(item, item.count + 1)}
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

function IndiaSummary({calc}) {
    if (!calc || calc.mode !== 'ps_india') return null;

    return (
        <div className={style.india}>
            <span className={style.indiaTitle}>Пополнение баланса PSN</span>

            <div className={style.indiaRow}>
                <span>Стоимость товаров</span>
                <span className={style.indiaValue}>{rupees(calc.rsTotal)}</span>
            </div>

            <div className={style.indiaRow}>
                <span>Пополним баланс, кратно 1000</span>
                <span className={style.indiaAccent}>{rupees(calc.rsRounded)}</span>
            </div>

            <div className={style.indiaRow}>
                <span>Пополнение в рублях</span>
                <span className={style.indiaValue}>{money(calc.topupRub)}</span>
            </div>

            <span className={style.indiaNote}>
                {calc.leftoverRs > 0
                    ? `Остаток ${rupees(calc.leftoverRs)} сохранится на аккаунте и уйдёт в счёт следующей покупки.`
                    : 'Сумма спишется ровно под расчёт, без остатка.'}
            </span>
        </div>
    );
}

export default function Basket() {
    const navigate = useNavigate();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();

    const userId = useSessionStore(selectUserId);
    const pageId = useSessionStore((state) => state.pageId);
    const pages = useStructureStore((state) => state.pages);
    const catalogs = useStructureStore((state) => state.catalogs);

    const items = useCartStore((state) => state.items);
    const revision = useCartStore((state) => state.revision);
    const loadCart = useCartStore((state) => state.load);
    const setCartCount = useCartStore((state) => state.setCount);

    const rememberPreviews = useProductStore((state) => state.rememberPreviews);

    const [promoCode, setPromoCode] = useState(() => recallView(PROMO_KEY) || '');
    const [recommendations, setRecommendations] = useState([]);

    const pending = usePendingOrder(userId);

    const page = useMemo(() => (pages || []).find((item) => item.id === pageId) || null, [pages, pageId]);
    const regionTitle = page?.name || null;
    const isIndia = page?.type === 'ps_india';

    const pageItems = useMemo(
        () => pageCartItems(items, catalogs, pageId),
        [items, catalogs, pageId]
    );

    const {quote, isLoading, error, retry} = useBasketQuote({userId, pageId, promoCode, revision});

    const scrollRef = useScrollMemory('basket', {ready: pageItems !== null});

    useEffect(() => {
        loadCart(userId);
    }, [userId, loadCart]);

    useEffect(() => {
        rememberView(PROMO_KEY, promoCode);
    }, [promoCode]);

    useEffect(() => {
        if (pageId === null) return undefined;

        const controller = new AbortController();

        fetchRecommendations(pageId, controller.signal)
            .then((list) => {
                const products = Array.isArray(list) ? list.slice(0, 10) : [];
                rememberPreviews(products);
                setRecommendations(products);
            })
            .catch(() => setRecommendations([]));

        return () => controller.abort();
    }, [pageId, rememberPreviews]);

    const back = useCallback(() => {
        hapticImpact('light');
        navigate('/main');
    }, [navigate]);

    const hasNativeBack = useBackButton(back);

    const openProduct = useCallback((product) => {
        hapticImpact('light');
        navigate(`/card/${product.id}`);
    }, [navigate]);

    const changeCount = useCallback((item, next) => {
        hapticSelection();
        setCartCount(userId, item.id, next);
    }, [setCartCount, userId]);

    const goToCheckout = useCallback(() => {
        hapticImpact('medium');
        navigate('/checkout');
    }, [navigate]);

    const count = pageItems?.length ?? 0;
    const isEmpty = pageItems !== null && count === 0;
    const total = quote?.total ?? 0;

    return (
        <div ref={scrollRef} className={style.screen}>
            <div
                className={style.header}
                style={{paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`}}
            >
                {hasNativeBack ? null : <BackPill className={style.back} onClick={back}/>}
                <h1 className={style.title}>Ваша корзина</h1>
            </div>

            <div
                className={style.content}
                style={{paddingBottom: `calc(${safeAreaInset.bottom}px + 20 * var(--u))`}}
            >
                {pending ? (
                    <button type="button" className={style.pending} onClick={goToCheckout}>
                        <span className={style.pendingDot} aria-hidden="true"/>
                        <span className={style.pendingBody}>
                            <span className={style.pendingTitle}>Заказ №{pending.id} ждёт оплаты</span>
                            <span className={style.pendingNote}>{money(pending.total)} — продолжить оплату</span>
                        </span>
                        <span className={style.pendingArrow} aria-hidden="true">›</span>
                    </button>
                ) : null}

                {pageItems === null ? (
                    <div className={style.skeletonList} aria-hidden="true">
                        <div className={`${style.skeletonRow} ${style.shimmer}`}/>
                        <div className={`${style.skeletonRow} ${style.shimmer}`}/>
                    </div>
                ) : isEmpty ? (
                    <EmptyState
                        icon="🛒"
                        title="В корзине пусто"
                        text="Добавьте игру, подписку или донат — соберём заказ и оформим за пару минут."
                        actionLabel="Перейти к покупкам"
                        onAction={() => navigate('/main')}
                    />
                ) : (
                    <>
                        <div className={style.list}>
                            {pageItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={style.listItem}
                                    style={{animationDelay: `${Math.min(index, 6) * 40}ms`}}
                                >
                                    <CartRow
                                        item={item}
                                        regionTitle={regionTitle}
                                        isRupee={isIndia && Boolean(item.priceInOtherCurrency)}
                                        onOpen={openProduct}
                                        onCount={changeCount}
                                    />
                                </div>
                            ))}
                        </div>

                        <PromoField
                            promo={quote?.promo || null}
                            onApply={setPromoCode}
                            onClear={() => setPromoCode('')}
                        />

                        <IndiaSummary calc={quote?.calc}/>

                        <div className={`${style.totals} ${isLoading ? style.totalsPending : ''}`}>
                            {error ? (
                                <button type="button" className={style.totalsRetry} onClick={retry}>
                                    Не удалось посчитать сумму. Повторить
                                </button>
                            ) : (
                                <>
                                    <div className={style.totalsRow}>
                                        <span className={style.totalsLabel}>
                                            {isIndia ? 'Пополнение и подписки' : `Товары (${count})`}
                                        </span>
                                        <span className={style.totalsValue}>{money(quote?.itemsTotal ?? 0)}</span>
                                    </div>

                                    {quote?.discount > 0 ? (
                                        <div className={style.totalsRow}>
                                            <span className={style.totalsLabel}>Скидка по промокоду</span>
                                            <span className={style.totalsDiscount}>−{money(quote.discount)}</span>
                                        </div>
                                    ) : null}

                                    <span className={style.totalsDivider} aria-hidden="true"/>

                                    <div className={style.totalsRow}>
                                        <span className={style.totalsFinalLabel}>Итого</span>
                                        <span className={style.totalsFinal}>{money(total)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}

                {recommendations.length ? (
                    <section className={style.recommend}>
                        <h2 className={style.recommendTitle}>Рекомендуем добавить</h2>

                        <div className={style.recommendTrack}>
                            {recommendations.map((product) => (
                                <ProductCard key={product.id} product={product} onOpen={openProduct}/>
                            ))}
                        </div>
                    </section>
                ) : null}
            </div>

            {!isEmpty && pageItems !== null ? (
                <div className={style.actionBar}>
                    <button
                        type="button"
                        className={style.primary}
                        disabled={isLoading || error || total <= 0}
                        onClick={goToCheckout}
                    >
                        {isLoading ? 'Считаем сумму…' : `Оформить заказ · ${money(total)}`}
                    </button>
                </div>
            ) : null}
        </div>
    );
}
