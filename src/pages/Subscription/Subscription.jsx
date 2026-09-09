import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {selectUserId, useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {selectCartCount, useCartStore} from '../../store/useCartStore';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {useBackButton} from '../../shared/hooks/useBackButton';
import {hapticImpact, hapticSelection} from '../../shared/lib/haptic';
import {regionIcon, regionTitle} from '../../shared/lib/region';
import {catalogRoute} from '../../shared/lib/pageRoutes';
import BackPill from '../../shared/ui/BackPill/BackPill';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import {cleanPath} from '../Main/catalogSections';
import {themeOf} from '../Services/servicesModel';
import SubscriptionBar from './SubscriptionBar';
import SubscriptionHero from './SubscriptionHero';
import SubscriptionPeriods from './SubscriptionPeriods';
import SubscriptionTiers from './SubscriptionTiers';
import {buildPlan, defaultSelection, locate} from './subscriptionModel';
import {useSubscriptionProducts} from './useSubscriptionProducts';
import style from './Subscription.module.scss';

const themeVars = (theme) => ({
    '--sub': theme.base,
    '--sub-edge': theme.edge,
    '--sub-ink': theme.ink,
    '--sub-text': theme.text,
    '--sub-ring': theme.ring,
    '--sub-glow': theme.glow
});

const monthsMatch = (one, two) => one.months !== null && one.months === two.months;

export default function Subscription() {
    const params = useParams();
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();

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

    const plan = useMemo(
        () => buildPlan(items, {catalogPath: path, title}),
        [items, path, title]
    );

    const region = useMemo(() => {
        const page = (pages || []).find((item) => item.id === pageId) || null;
        const startPage = (startPages || []).find((item) => item.structurePageId === pageId) || null;
        if (!page && !startPage) return null;

        return {title: regionTitle(page, startPage), icon: regionIcon(page, startPage)};
    }, [pages, startPages, pageId]);

    const [selection, setSelection] = useState(null);

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

    const goBack = useCallback(() => {
        hapticImpact('light');
        if (window.history.length > 1) navigate(-1);
        else navigate('/main');
    }, [navigate]);

    const hasNativeBack = useBackButton(goBack);

    const selectTier = useCallback((key) => {
        hapticSelection();

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
        hapticSelection();
        setSelection((prev) => ({tierKey: prev?.tierKey ?? tier?.key ?? null, periodId: id}));
    }, [tier]);

    const addProduct = useCallback(async () => {
        if (!period?.product || isAdding) return;

        hapticImpact('medium');
        setIsAdding(true);

        try {
            await addToCart(userId, period.product);
        } finally {
            setIsAdding(false);
        }
    }, [period, isAdding, addToCart, userId]);

    const changeCount = useCallback((next) => {
        if (productId === null) return;
        hapticSelection();
        setCartCount(userId, productId, next);
    }, [setCartCount, userId, productId]);

    const openBasket = useCallback(() => {
        hapticImpact('light');
        navigate('/basket');
    }, [navigate]);

    const openCatalog = useCallback(() => {
        hapticImpact('light');
        navigate(catalogRoute(path));
    }, [navigate, path]);

    const isMissing = Array.isArray(catalogs) && catalogId === null;
    const isEmpty = items !== null && plan === null;

    const head = (
        <div
            className={style.header}
            style={{paddingTop: `calc(${contentSafeAreaInset.top}px + 12 * var(--u))`}}
        >
            {hasNativeBack ? null : <BackPill className={style.back} onClick={goBack}/>}
            <h1 className={style.title}>{plan?.title || title || 'Подписки'}</h1>

            {region ? (
                <span className={style.region}>
                    {region.icon ? <img className={style.regionIcon} src={region.icon} alt=""/> : null}
                    {region.title}
                </span>
            ) : null}
        </div>
    );

    if (isMissing || isEmpty || error) {
        return (
            <div className={style.screen}>
                {head}

                <div className={style.content}>
                    <EmptyState
                        icon={error ? '📡' : '🗂'}
                        title={error ? 'Не удалось загрузить' : 'Подписок пока нет'}
                        text={error
                            ? 'Проверьте связь и попробуйте ещё раз.'
                            : 'В этом разделе пока не заведено ни одной подписки.'}
                        actionLabel={error ? 'Повторить' : 'Открыть каталог'}
                        onAction={error ? retry : openCatalog}
                    />
                </div>
            </div>
        );
    }

    if (!plan || !tier) {
        return (
            <div className={style.screen}>
                {head}

                <div className={style.content}>
                    <div className={style.skeletonHero}/>
                    <div className={style.skeletonBlock}/>
                    <div className={style.skeletonBlock}/>
                </div>
            </div>
        );
    }

    const theme = themeOf({accent: tier.accent}, 0);
    const summary = [tier.name, period?.label].filter(Boolean).join(' · ');

    return (
        <div className={style.screen} style={themeVars(theme)}>
            {head}

            <div
                className={style.content}
                style={{paddingBottom: `calc(${safeAreaInset.bottom}px + 16 * var(--u))`}}
            >
                <SubscriptionHero
                    brandName={plan.brand.name}
                    tier={tier}
                    period={period}
                    region={region}
                />

                <SubscriptionTiers tiers={plan.tiers} activeKey={tier.key} onSelect={selectTier}/>

                <SubscriptionPeriods tier={tier} activeId={period?.id ?? null} onSelect={selectPeriod}/>

                {plan.includes.length > 0 ? (
                    <section className={style.block}>
                        <h2 className={style.blockTitle}>Что входит</h2>

                        <div className={style.includes}>
                            {plan.includes.map((line) => (
                                <span key={line} className={style.include}>
                                    <span className={style.includeMark} aria-hidden="true">✓</span>
                                    {line}
                                </span>
                            ))}
                        </div>
                    </section>
                ) : null}

                <button type="button" className={style.toCatalog} onClick={openCatalog}>
                    Посмотреть все позиции
                </button>
            </div>

            <SubscriptionBar
                period={period}
                summary={summary}
                count={cartCount}
                isBusy={isAdding}
                bottomInset={safeAreaInset.bottom}
                onAdd={addProduct}
                onChangeCount={changeCount}
                onOpenBasket={openBasket}
            />
        </div>
    );
}
