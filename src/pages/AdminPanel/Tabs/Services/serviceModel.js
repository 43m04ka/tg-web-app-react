export const KIND_OPTIONS = [
    {key: 'gift_card', name: 'Подарочная карта'},
    {key: 'subscription', name: 'Подписка'},
];

export const kindName = (key) => KIND_OPTIONS.find((option) => option.key === key)?.name || key || '—';

export const FULFILLMENT_OPTIONS = [
    {key: 'supplier', name: 'Автовыдача PanYanStore'},
    {key: 'code', name: 'Код со своего склада'},
    {key: 'manual', name: 'Оформляет менеджер'},
];

export const MATRIX_FULFILLMENT_OPTIONS = FULFILLMENT_OPTIONS.filter((option) => option.key !== 'supplier');

export const fulfillmentName = (key) =>
    FULFILLMENT_OPTIONS.find((option) => option.key === key)?.name || 'Код со склада';

export const isManual = (offer) => offer?.fulfillment === 'manual';

export const isSupplier = (offer) => offer?.fulfillment === 'supplier';

export const MARKUP_OPTIONS = [
    {key: '', name: 'Без комиссии'},
    {key: 'percent', name: 'В процентах'},
    {key: 'fixed', name: 'В рублях'},
];

export const hasMarkup = (offer) => Boolean(offer?.markupType) && Number(offer?.markupValue) > 0;

export const markupText = (offer) => {
    if (!hasMarkup(offer)) return '';
    const value = Number(offer.markupValue);
    return offer.markupType === 'percent'
        ? `+${String(value).replace('.', ',')}%`
        : `+${value.toLocaleString('ru-RU')} ₽`;
};

export const salePrice = (base, markupType, markupValue) => {
    const price = Number(base);
    if (!Number.isFinite(price) || price <= 0) return null;

    const value = Number(String(markupValue ?? '').replace(',', '.')) || 0;
    let result = price;

    if (markupType === 'percent') result = price * (1 + value / 100);
    else if (markupType === 'fixed') result = price + value;

    return Math.ceil(Number(result.toFixed(6)));
};

export const offerPrice = (offer) => (isSupplier(offer) && offer.salePrice ? offer.salePrice : offer?.price);

export const isFromCatalog = (offer) => Boolean(offer?.fromCatalog);


export const emptyStock = {available: 0, reserved: 0, sold: 0};

export const brandStock = (brand) => (brand.offers || []).reduce((sum, offer) => ({
    available: sum.available + (offer.stock?.available || 0),
    reserved: sum.reserved + (offer.stock?.reserved || 0),
    sold: sum.sold + (offer.stock?.sold || 0),
}), {...emptyStock});

export const money = (value) => `${Number(value || 0).toLocaleString('ru-RU')} ₽`;

export const parsePrice = (raw) => {
    const text = String(raw).trim();
    if (!text) return null;

    const value = Number(text);
    if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) return null;

    return value;
};

export const countCodeLines = (raw) => [...new Set(
    String(raw || '')
        .split(/[\r\n]+/)
        .map((line) => line.trim())
        .filter(Boolean)
)].length;
