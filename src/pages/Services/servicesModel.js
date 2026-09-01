export const KIND_LABELS = {
    gift_card: 'Подарочная карта',
    subscription: 'Подписка'
};

export const kindLabel = (kind) => KIND_LABELS[kind] || 'Код';

export const uniqueBy = (list, pick) => {
    const seen = new Set();
    const result = [];

    (list || []).forEach((item) => {
        const key = pick(item);
        if (key === null || key === undefined || seen.has(key)) return;
        seen.add(key);
        result.push(item);
    });

    return result;
};

export const kindsOf = (brand) => uniqueBy(brand?.offers || [], (offer) => offer.kind)
    .map((offer) => offer.kind);

export const regionsOf = (brand, kind) => uniqueBy(
    (brand?.offers || []).filter((offer) => offer.kind === kind),
    (offer) => offer.regionName
).map((offer) => ({name: offer.regionName, flag: offer.regionFlag, icon: offer.regionIcon}));

export const UNGROUPED = '';

export const groupsOf = (brand, kind, regionName) => uniqueBy(
    (brand?.offers || []).filter((offer) => offer.kind === kind && offer.regionName === regionName),
    (offer) => offer.groupName || UNGROUPED
).map((offer) => ({
    key: offer.groupName || UNGROUPED,
    name: offer.groupName || 'Остальное'
}));

export const offersOf = (brand, kind, regionName, groupKey) => (brand?.offers || [])
    .filter((offer) => offer.kind === kind && offer.regionName === regionName)
    .filter((offer) => (groupKey === null ? true : (offer.groupName || UNGROUPED) === groupKey));

export const isManual = (offer) => offer?.fulfillment === 'manual';

export const isSellable = (offer) => {
    if (!offer) return false;
    if (isManual(offer)) return true;

    return Number(offer.stock) > 0;
};

export const stockLabel = (offer) => {
    if (isManual(offer)) return 'Оформит менеджер';

    const count = Number(offer?.stock) || 0;
    if (count <= 0) return 'Нет в наличии';
    if (count <= 3) return `Осталось ${count}`;

    return 'В наличии';
};

export const groupLabelOf = (brand) => brand?.groupLabel || 'Тариф';

export const denomLabelOf = (kind) => (kind === 'subscription' ? 'Период' : 'Номинал');

export const priceNoteOf = (kind) => (kind === 'subscription' ? 'Цена за подписку' : 'Цены за 1 код');

export const deliveryLabelOf = (offer, brand) => {
    if (isManual(offer)) return brand?.deliveryNote || 'Оформит менеджер после оплаты';

    return 'Мгновенно, в чат';
};

export const BRAND_TONES = [
    {from: 'oklch(0.42 0.12 250)', to: 'oklch(0.18 0.03 250)', ring: 'oklch(0.6 0.14 250 / 0.32)'},
    {from: 'oklch(0.42 0.13 300)', to: 'oklch(0.18 0.03 290)', ring: 'oklch(0.62 0.15 300 / 0.32)'},
    {from: 'oklch(0.42 0.13 148)', to: 'oklch(0.18 0.03 160)', ring: 'oklch(0.6 0.15 148 / 0.32)'},
    {from: 'oklch(0.44 0.13 40)', to: 'oklch(0.18 0.03 40)', ring: 'oklch(0.65 0.16 40 / 0.32)'},
    {from: 'oklch(0.42 0.15 15)', to: 'oklch(0.18 0.03 15)', ring: 'oklch(0.64 0.18 15 / 0.32)'}
];

export const toneOf = (brand, index) => {
    if (brand?.accent) {
        return {from: brand.accent, to: 'oklch(0.17 0.02 264)', ring: brand.accent};
    }

    return BRAND_TONES[index % BRAND_TONES.length];
};
