export const BANNER_TYPES = ['product', 'custom'];

export const TYPE_LABELS = {
    product: 'Товар',
    custom: 'Свой',
};

export const IMAGE_FIT_LABELS = {
    banner: 'Целиком (4:3)',
    coverTop: 'Обложка, верх',
};

export const DEFAULT_GRADIENT = 'linear-gradient(115deg, oklch(0.5 0.17 340), oklch(0.42 0.16 30))';

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
// Что не разобралось — показываем как есть, лишь бы админ видел исходное значение.
export const formatPromoDate = (value) => {
    if (!value) return '';

    const asNumber = Number(value);
    const parsed = Number.isFinite(asNumber) && String(value).trim() !== ''
        ? asNumber
        : Date.parse(value);

    if (Number.isFinite(parsed)) {
        const date = new Date(parsed);
        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit', year: '2-digit'});
        }
    }

    return String(value);
};

export const emptyBanner = (type) => ({
    type,
    pageId: null,
    serialNumber: 0,
    isHidden: 0,
    data: type === 'product'
        ? {productId: null, subtitle: '', note: '', url: '', override: {title: '', image: '', imageFit: ''}}
        : {title: '', subtitle: '', note: '', url: '', image: '', imageFit: 'banner', gradient: DEFAULT_GRADIENT},
});
