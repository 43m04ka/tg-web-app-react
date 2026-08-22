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

// Дата акции приходит из парсера строкой в разных видах. Что не разобралось —
// не показываем вовсе: на баннере строка вида «2026-11-19T00:00:00Z» выглядит браком.
export const formatPromoDate = (value) => {
    if (!value) return '';

    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) return '';

    return new Date(parsed).toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit'});
};

export const selectPageBanners = (banners, pageId) =>
    (banners || []).filter((banner) => banner.pageId === null || banner.pageId === pageId);
