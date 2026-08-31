export const formatPrice = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const number = Number(value);
    if (!Number.isFinite(number)) return '';
    return `${number.toLocaleString('ru-RU')} ₽`;
};

export const discountPercent = (price, oldPrice) => {
    const now = Number(price);
    const before = Number(oldPrice);
    if (!Number.isFinite(now) || !Number.isFinite(before) || before <= now || before <= 0) return 0;
    return Math.round((1 - now / before) * 100);
};

// Парсер кладёт дату акции строкой с epoch-миллисекундами («1787785140000»),
// но поле текстовое, так что в старых записях встречается и обычная дата.
// Что не разобралось — не показываем вовсе: сырая строка на баннере выглядит браком.
export const toPromoDate = (value) => {
    if (!value) return null;

    const asNumber = Number(value);
    const parsed = Number.isFinite(asNumber) && String(value).trim() !== ''
        ? asNumber
        : Date.parse(value);

    if (!Number.isFinite(parsed)) return null;

    const date = new Date(parsed);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const formatPromoDate = (value) => {
    const date = toPromoDate(value);
    return date ? date.toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit'}) : '';
};

export const selectPageBanners = (banners, pageId) =>
    (banners || []).filter((banner) => banner.pageId === null || banner.pageId === pageId);
