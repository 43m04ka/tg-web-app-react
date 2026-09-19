import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {selectUserId, useSessionStore} from '../../../store/useSessionStore';
import {useStructureStore} from '../../../store/useStructureStore';
import {selectCartCount, useCartStore} from '../../../store/useCartStore';
import {regionIcon, regionTitle} from '../../../shared/lib/region';
import {catalogRoute} from '../../../shared/lib/pageRoutes';
import EmptyState from '../../../shared/ui/EmptyState/EmptyState';
import {cleanPath, formatPrice} from '../../../pages/Main/catalogSections';
import {pluralOf} from '../../../shared/lib/plural';
import {themeOf} from '../../../pages/Services/servicesModel';
import SubscriptionInfo, {showsPlayStationInfo} from '../../../pages/Subscription/SubscriptionInfo';
import {buildPlan, defaultSelection, locate} from '../../../pages/Subscription/subscriptionModel';
import {useSubscriptionProducts} from '../../../pages/Subscription/useSubscriptionProducts';
import {useScrollMemory} from '../../shell/ScrollAreaContext';
import Spinner from '../../ui/Spinner';
import BackLink from '../../ui/BackLink';
import style from './DesktopSubscription.module.scss';

const VARIANT_WORDS = ['вариант', 'варианта', 'вариантов'];

const themeVars = (theme) => ({
    '--sub': theme.base,
    '--sub-edge': theme.edge,
    '--sub-ink': theme.ink,
    '--sub-text': theme.text,
    '--sub-ring': theme.ring,
    '--sub-glow': theme.glow
});

const monthsMatch = (one, two) => one.months !== null && one.months === two.months;

export default function DesktopSubscription() {
    const params = useParams();
    const navigate = useNavigate();
    const [search] = useSearchParams();

    const path = cleanPath(params['*'] || '');
    const option = search.get('option');

    const userId = useSessionStore(selectUserId);
    const pageId = useSessionStore((state) => state.pageId);
    const pages = useStructureStore((state) => state.pages);
    const startPages = useStructureStore((state) => state.startPages);
    const catalogs = useStructureStore((state) => state.catalogs);
    const structureBlocks = useStructureStore((state) => state.structureBlocks);
    const mainPageProducts = useStructureStore((state) => state.mainPageProducts);

    const catalogId = useMemo(
        () => (catalogs || []).find((catalog) => catalog.path === path)?.id ?? null,
        [catalogs, path]
    );

    const title = useMemo(
        () => (structureBlocks || []).find((block) => cleanPath(block.path) === path)?.name || null,
        [structureBlocks, path]
    );

    const seed = useMemo(
        () => (mainPageProducts || []).filter((product) => product.catalogId === catalogId),
        [mainPageProducts, catalogId]
    );

    const {items, error, retry} = useSubscriptionProducts(catalogId, seed);

    const plan = useMemo(() => buildPlan(items, {catalogPath: path, title}), [items, path, title]);

    const region = useMemo(() => {
        const page = (pages || []).find((item) => item.id === pageId) || null;
        const startPage = (startPages || []).find((item) => item.structurePageId === pageId) || null;
        if (!page && !startPage) return null;

        return {title: regionTitle(page, startPage), icon: regionIcon(page, startPage)};
    }, [pages, startPages, pageId]);

    const [selection, setSelection] = useState(null);

    useScrollMemory(`subscription:${path}`, {ready: plan !== null});

    useEffect(() => {
        if (!plan) return;

        setSelection((prev) => {
            const stillThere = prev
                && plan.tiers.some((tier) => tier.periods.some((period) => period.id === prev.periodId));

            return stillThere ? prev : (locate(plan, option) || defaultSelection(plan));
        });
    }, [plan, option]);

    const tier = useMemo(
        () => plan?.tiers.find((item) => item.key === selection?.tierKey) || plan?.tiers[0] || null,
        [plan, selection]
    );

    const period = useMemo(
        () => tier?.periods.find((item) => item.id === selection?.periodId) || null,
        [tier, selection]
    );

    const productId = period?.id ?? null;

    const loadCart = useCartStore((state) => state.load);
    const addToCart = useCartStore((state) => state.add);
    const setCartCount = useCartStore((state) => state.setCount);
    const cartCount = useCartStore(selectCartCount(productId));

    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadCart(userId);
    }, [userId, loadCart]);

    const selectTier = useCallback((key) => {
        setSelection((prev) => {
            const next = plan?.tiers.find((item) => item.key === key);
            if (!next) return prev;

            const current = tier?.periods.find((item) => item.id === prev?.periodId) || null;
            const twin = current ? next.periods.find((item) => monthsMatch(item, current)) : null;
            const fallback = next.periods.find((item) => item.isAvailable) || next.periods[0];

            return {tierKey: key, periodId: (twin || fallback)?.id ?? null};
        });
    }, [plan, tier]);

    const selectPeriod = useCallback((id) => {
        setSelection((prev) => ({tierKey: prev?.tierKey ?? tier?.key ?? null, periodId: id}));
    }, [tier]);

    const addProduct = useCallback(async () => {
        if (!period?.product || isAdding) return;

        setIsAdding(true);

        try {
            await addToCart(userId, period.product);
        } finally {
            setIsAdding(false);
        }
    }, [period, isAdding, addToCart, userId]);

    const changeCount = useCallback((next) => {
        if (productId === null) return;
        setCartCount(userId, productId, next);
    }, [setCartCount, userId, productId]);

    const openCatalog = useCallback(() => navigate(catalogRoute(path)), [navigate, path]);

    const isMissing = Array.isArray(catalogs) && catalogId === null;
    const isEmpty = items !== null && plan === null;

    if (isMissing || isEmpty || error) {
        return (
            <EmptyState
                icon={error ? '📡' : '🗂'}
                title={error ? 'Не удалось загрузить' : 'Подписок пока нет'}
                text={error
                    ? 'Проверьте связь и попробуйте ещё раз.'
                    : 'В этом разделе пока не заведено ни одной подписки.'}
                actionLabel={error ? 'Повторить' : 'Открыть каталог'}
                onAction={error ? retry : openCatalog}
            />
        );
    }

    if (!plan || !tier) {
        return (
            <div className={style.screen}>
                <div className={style.skeletonHead}/>
                <div className={style.body}>
                    <div className={style.skeletonHero}/>
                    <div className={style.skeletonPanel}/>
                </div>
            </div>
        );
    }

    const theme = tier.theme || themeOf({accent: tier.accent}, 0);
    const periods = tier.periods;

    return (
        <div className={style.screen} style={themeVars(theme)}>
            <BackLink to="/" label="Назад"/>

            <header className={style.head}>
                <h1 className={style.title}>{plan.title || title || 'Подписки'}</h1>

                {region ? (
                    <span className={style.region}>
                        {region.icon ? <img className={style.regionIcon} src={region.icon} alt=""/> : null}
                        {region.title}
                    </span>
                ) : null}
            </header>

            <div className={style.body}>
                <div className={style.main}>
                    <div className={style.hero}>
                        <span className={style.heroGlow} aria-hidden="true"/>

                        <div className={style.heroTop}>
                            <div className={style.heroTitles}>
                                <span className={style.heroBrand}>{plan.brand.name}</span>
                                <span className={style.heroTier}>{tier.name}</span>
                            </div>

                            {region?.icon ? (
                                <img className={style.heroIcon} src={region.icon} alt="" aria-hidden="true"/>
                            ) : null}
                        </div>

                        <div className={style.heroGrid}>
                            <div className={style.heroCell}>
                                <span className={style.heroLabel}>{tier.tagline ? 'Тариф включает' : 'Срок'}</span>
                                <span className={style.heroValue}>{tier.tagline || period?.label || '—'}</span>
                            </div>

                            <div className={style.heroCell}>
                                <span className={style.heroLabel}>Цена за месяц</span>
                                <span className={style.heroValue}>
                                    {period?.perMonth ? `${formatPrice(period.perMonth)} / мес` : '—'}
                                </span>
                            </div>

                            {region ? (
                                <div className={style.heroCell}>
                                    <span className={style.heroLabel}>Регион</span>
                                    <span className={style.heroValue}>{region.title}</span>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {plan.tiers.length > 1 ? (
                        <section className={style.block}>
                            <h2 className={style.blockTitle}>
                                {plan.tiers.length <= 2 ? 'Куда активируем' : 'Тариф'}
                            </h2>

                            <div className={style.tiers}>
                                {plan.tiers.map((item, index) => {
                                    const isActive = item.key === tier.key;
                                    const from = item.fromPerMonth ?? item.fromPrice;

                                    return (
                                        <button
                                            key={item.key}
                                            type="button"
                                            className={isActive ? `${style.tier} ${style.tierActive}` : style.tier}
                                            style={{'--tier-dot': item.dot, '--i': index}}
                                            aria-pressed={isActive}
                                            onClick={() => selectTier(item.key)}
                                        >
                                            <span className={style.tierName}>
                                                <span className={style.tierDot} aria-hidden="true"/>
                                                {item.name}
                                            </span>

                                            {item.tagline ? (
                                                <span className={style.tierNote}>{item.tagline}</span>
                                            ) : null}

                                            {from ? (
                                                <span className={style.tierFrom}>
                                                    от {formatPrice(from)}{item.fromPerMonth ? ' / мес' : ''}
                                                </span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    ) : null}

                    {periods.length ? (
                        <section className={style.block}>
                            <div className={style.blockHead}>
                                <h2 className={style.blockTitle}>Срок подписки</h2>
                                {periods.length > 1 ? (
                                    <span className={style.blockNote}>
                                        {periods.length} {pluralOf(periods.length, VARIANT_WORDS)}
                                    </span>
                                ) : null}
                            </div>

                            <div className={style.periods}>
                                {periods.map((item, index) => {
                                    const isActive = item.id === period?.id;

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            className={[
                                                style.period,
                                                isActive ? style.periodActive : '',
                                                item.isAvailable ? '' : style.periodLocked
                                            ].filter(Boolean).join(' ')}
                                            style={{'--i': index}}
                                            disabled={!item.isAvailable}
                                            aria-pressed={isActive}
                                            onClick={() => selectPeriod(item.id)}
                                        >
                                            <span className={isActive ? `${style.tick} ${style.tickOn}` : style.tick}>
                                                ✓
                                            </span>

                                            <span className={style.periodBody}>
                                                <span className={style.periodTitle}>
                                                    {item.label}
                                                    {item.badge ? (
                                                        <span className={style.badge}>{item.badge}</span>
                                                    ) : null}
                                                </span>

                                                <span className={style.periodNote}>
                                                    {item.isAvailable
                                                        ? (item.perMonth
                                                            ? `${formatPrice(item.perMonth)} / мес`
                                                            : 'Разовая оплата')
                                                        : 'Нет в продаже'}
                                                </span>
                                            </span>

                                            <span className={style.periodPrices}>
                                                <span className={style.periodPrice}>{formatPrice(item.price)}</span>
                                                {item.oldPrice ? (
                                                    <span className={style.periodOldPrice}>
                                                        {formatPrice(item.oldPrice)}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {tier.hint ? (
                                <p className={style.hint}>
                                    <span className={style.hintMark} aria-hidden="true">📉</span>
                                    {tier.hint}
                                </p>
                            ) : null}
                        </section>
                    ) : null}

                    {showsPlayStationInfo(plan.brand.key, path) ? <SubscriptionInfo/> : null}

                    <button type="button" className={style.toCatalog} onClick={openCatalog}>
                        Посмотреть все позиции
                        <span className={style.toCatalogArrow} aria-hidden="true">→</span>
                    </button>
                </div>

                <aside className={style.panel}>
                    <span className={style.panelTitle}>Выбрано</span>

                    <div className={style.pick}>
                        <span className={style.pickLabel}>{tier.name}</span>
                        <span className={style.pickValue}>{period?.label || '—'}</span>
                    </div>

                    <div className={style.totalRow}>
                        <span className={style.totalLabel}>Цена</span>
                        <span key={period?.price} className={style.totalValue}>
                            {period ? formatPrice(period.price) : '—'}
                        </span>
                    </div>

                    {period?.perMonth ? (
                        <span className={style.perMonth}>{formatPrice(period.perMonth)} в месяц</span>
                    ) : null}

                    {cartCount > 0 ? (
                        <div className={style.counterRow}>
                            <div className={style.counter}>
                                <button
                                    type="button"
                                    className={style.counterButton}
                                    aria-label="Убрать одну штуку"
                                    onClick={() => changeCount(cartCount - 1)}
                                >
                                    −
                                </button>

                                <span key={cartCount} className={style.counterValue}>{cartCount}</span>

                                <button
                                    type="button"
                                    className={style.counterButton}
                                    aria-label="Добавить ещё одну штуку"
                                    onClick={() => changeCount(cartCount + 1)}
                                >
                                    +
                                </button>
                            </div>

                            <button type="button" className={style.primary} onClick={() => navigate('/basket')}>
                                В корзину
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            className={style.primary}
                            disabled={!period?.isAvailable || isAdding}
                            onClick={addProduct}
                        >
                            {isAdding ? <Spinner/> : null}
                            {isAdding ? 'Добавляем…' : 'Добавить в корзину'}
                        </button>
                    )}
                </aside>
            </div>
        </div>
    );
}
