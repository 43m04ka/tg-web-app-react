export const KIND_OPTIONS = [
    {key: 'gift_card', name: 'Подарочная карта'},
    {key: 'subscription', name: 'Подписка'},
];

export const kindName = (key) => KIND_OPTIONS.find((option) => option.key === key)?.name || key || '—';

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
