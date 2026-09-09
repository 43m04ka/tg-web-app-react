import {isSubscription, subscriptionTerm} from '../Main/catalogSections';
import {isPurchasable} from '../Product/productView';
import {brandOf, tierStyleOf} from './subscriptionBrands';

const MONTH_PATTERNS = [
    {re: /(\d+)\s*(?:мес|month|mo)/i, factor: 1},
    {re: /(\d+)\s*(?:год|года|лет|year|yr)/i, factor: 12}
];

const MIN_SAVING = 0.05;

const text = (value) => String(value || '').trim();

const numberOrNull = (value) => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
};

export const monthsOf = (product) => {
    for (const source of [product?.choiceRow, product?.name]) {
        const raw = text(source);
        if (!raw) continue;

        for (const {re, factor} of MONTH_PATTERNS) {
            const found = raw.match(re);
            if (found) return Number(found[1]) * factor;
        }
    }

    return null;
};

const periodLabel = (product) => text(product.choiceRow)
    || subscriptionTerm(product)
    || text(product.name)
    || 'Вариант';

const perMonthOf = (price, months) =>
    (months && months >= 2 && price ? Math.round(price / months) : null);

const buildPeriod = (product) => {
    const months = monthsOf(product);
    const price = numberOrNull(product.price);

    return {
        id: product.id,
        product,
        label: periodLabel(product),
        months,
        price,
        oldPrice: numberOrNull(product.oldPrice),
        perMonth: perMonthOf(price, months),
        isAvailable: isPurchasable(product),
        order: product.serialNumber ?? 0
    };
};

const comparePeriods = (a, b) => {
    if (a.months !== null && b.months !== null && a.months !== b.months) return a.months - b.months;
    if (a.months === null && b.months !== null) return 1;
    if (a.months !== null && b.months === null) return -1;
    if (a.order !== b.order) return a.order - b.order;
    return (a.price || 0) - (b.price || 0);
};

const withBadges = (periods) => {
    const rated = periods.filter((period) => period.isAvailable && period.perMonth !== null);
    if (rated.length < 2 || periods.length < 3) return periods;

    const sorted = [...rated].sort((a, b) => a.perMonth - b.perMonth);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const runnerUp = sorted[1];

    const badges = new Map([[best.id, 'Лучшая цена']]);

    if (runnerUp && runnerUp.id !== worst.id && 1 - runnerUp.perMonth / worst.perMonth >= MIN_SAVING) {
        badges.set(runnerUp.id, 'Выгодно');
    }

    return periods.map((period) => ({...period, badge: badges.get(period.id) || null}));
};

const savingHint = (periods) => {
    const rated = periods.filter((period) => period.isAvailable && period.perMonth !== null);
    if (rated.length < 3) return null;

    const sorted = [...rated].sort((a, b) => a.perMonth - b.perMonth);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const saving = Math.round((1 - best.perMonth / worst.perMonth) * 100);

    if (saving < MIN_SAVING * 100) return null;

    return `Чем дольше срок, тем ниже цена за месяц. На ${best.label} выгода доходит до ${saving}%.`;
};

const buildTier = (brand, name, products) => {
    const periods = withBadges(products.map(buildPeriod).sort(comparePeriods));
    const style = tierStyleOf(brand, name);
    const available = periods.filter((period) => period.isAvailable);

    const fromPerMonth = available
        .map((period) => period.perMonth)
        .filter((value) => value !== null)
        .sort((a, b) => a - b)[0] ?? null;

    const fromPrice = available
        .map((period) => period.price)
        .filter((value) => value !== null)
        .sort((a, b) => a - b)[0] ?? null;

    return {
        key: name || brand.key,
        name: name || brand.name,
        tagline: style?.tagline || null,
        accent: style?.accent || brand.accent,
        periods,
        hint: savingHint(periods),
        fromPerMonth,
        fromPrice,
        order: products.reduce((min, item) => Math.min(min, item.serialNumber ?? 0), Number.MAX_SAFE_INTEGER)
    };
};

export const buildPlan = (products, {catalogPath, title} = {}) => {
    const list = (products || []).filter(isSubscription);
    if (list.length === 0) return null;

    const brand = brandOf([catalogPath, title, list[0]?.name]);

    const byTier = new Map();
    list.forEach((product) => {
        const name = text(product.choiceColumn);
        const bucket = byTier.get(name);
        if (bucket) bucket.push(product);
        else byTier.set(name, [product]);
    });

    const tiers = [...byTier.entries()]
        .map(([name, items]) => buildTier(brand, name, items))
        .filter((tier) => tier.periods.length > 0)
        .sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name, 'ru'));

    const bubbles = list
        .flatMap((product) => product.bubbles || [])
        .map(text)
        .filter(Boolean);

    const includes = bubbles.length > 0
        ? [...new Set(bubbles)].slice(0, 4)
        : brand.includes;

    return {brand, tiers, includes, title: title || brand.name};
};

export const locate = (plan, productId) => {
    const id = Number(productId);
    if (!plan || !Number.isFinite(id)) return null;

    for (const tier of plan.tiers) {
        const period = tier.periods.find((item) => item.id === id);
        if (period) return {tierKey: tier.key, periodId: period.id};
    }

    return null;
};

export const defaultSelection = (plan) => {
    if (!plan || plan.tiers.length === 0) return null;

    const tier = plan.tiers.find((item) => item.periods.some((period) => period.isAvailable))
        || plan.tiers[0];

    const period = tier.periods.find((item) => item.isAvailable) || tier.periods[0];

    return {tierKey: tier.key, periodId: period.id};
};
