export const KIND_OPTIONS = [
    {key: 'gift_card', name: 'Подарочная карта'},
    {key: 'subscription', name: 'Подписка'},
];

export const kindName = (key) => KIND_OPTIONS.find((option) => option.key === key)?.name || key || '—';

export const FULFILLMENT_OPTIONS = [
    {key: 'code', name: 'Код со склада'},
    {key: 'manual', name: 'Оформляет менеджер'},
];

export const fulfillmentName = (key) =>
    FULFILLMENT_OPTIONS.find((option) => option.key === key)?.name || 'Код со склада';

export const isManual = (offer) => offer?.fulfillment === 'manual';

export const isFromCatalog = (offer) => Boolean(offer?.fromCatalog);

export const ACCENT_PRESETS = [
    {name: 'Spotify', value: 'oklch(0.55 0.17 152)'},
    {name: 'Изумруд', value: 'oklch(0.5 0.13 165)'},
    {name: 'Бирюза', value: 'oklch(0.5 0.09 195)'},
    {name: 'Небо', value: 'oklch(0.52 0.13 232)'},
    {name: 'Синий', value: 'oklch(0.48 0.16 262)'},
    {name: 'Индиго', value: 'oklch(0.45 0.17 285)'},
    {name: 'Пурпур', value: 'oklch(0.48 0.17 310)'},
    {name: 'Малина', value: 'oklch(0.52 0.18 350)'},
    {name: 'Красный', value: 'oklch(0.52 0.19 25)'},
    {name: 'Терракота', value: 'oklch(0.6 0.13 45)'},
    {name: 'Янтарь', value: 'oklch(0.62 0.14 75)'},
    {name: 'Графит', value: 'oklch(0.38 0.02 260)'},
];

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
