export const BANNER_TYPES = [
    {value: 'product', title: 'Товар'},
    {value: 'custom', title: 'Произвольный'}
];

export const IMAGE_FITS = [
    {value: 'banner', title: 'Целиком (картинка 4:3)'},
    {value: 'coverTop', title: 'Кадрировать сверху (обложка)'}
];

export const GRADIENT_PRESETS = [
    'linear-gradient(115deg, oklch(0.5 0.17 340), oklch(0.42 0.16 30))',
    'linear-gradient(115deg, oklch(0.48 0.15 260), oklch(0.38 0.12 210))',
    'linear-gradient(115deg, oklch(0.5 0.16 150), oklch(0.36 0.12 190))',
    'linear-gradient(115deg, oklch(0.52 0.15 60), oklch(0.4 0.14 30))'
];

const text = (value) => (value === null || value === undefined ? '' : String(value));

const numberOrNull = (value) => {
    if (value === null || value === undefined || value === '') return null;

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export const emptyBanner = (pageId = null) => ({
    pageId,
    type: 'product',
    serialNumber: 0,
    isHidden: false,
    productId: '',
    title: '',
    subtitle: '',
    note: '',
    url: '',
    image: '',
    imageFit: 'banner',
    gradient: GRADIENT_PRESETS[0],
    price: '',
    oldPrice: '',
    promoEndDate: ''
});

export const toDraft = (banner) => {
    if (!banner) return emptyBanner();

    const data = banner.data || {};
    const override = data.override || {};

    return {
        pageId: banner.pageId ?? null,
        type: banner.type || 'product',
        serialNumber: banner.serialNumber ?? 0,
        isHidden: Boolean(banner.isHidden),
        productId: text(data.productId),
        title: banner.type === 'product' ? text(override.title) : text(data.title),
        subtitle: text(data.subtitle),
        note: text(data.note),
        url: text(data.url),
        image: banner.type === 'product' ? text(override.image) : text(data.image),
        imageFit: text(override.imageFit) || text(data.imageFit) || 'banner',
        gradient: text(data.gradient) || GRADIENT_PRESETS[0],
        price: data.price === null || data.price === undefined ? '' : String(data.price),
        oldPrice: data.oldPrice === null || data.oldPrice === undefined ? '' : String(data.oldPrice),
        promoEndDate: text(data.promoEndDate)
    };
};

export const toPayload = (draft) => {
    const base = {
        pageId: draft.pageId === null || draft.pageId === '' ? null : Number(draft.pageId),
        type: draft.type,
        serialNumber: Number(draft.serialNumber) || 0,
        isHidden: draft.isHidden ? 1 : 0
    };

    if (draft.type === 'product') {
        return {
            ...base,
            data: {
                productId: numberOrNull(draft.productId),
                subtitle: draft.subtitle.trim(),
                note: draft.note.trim(),
                url: draft.url.trim(),
                override: {
                    title: draft.title.trim(),
                    image: draft.image.trim(),
                    imageFit: draft.image.trim() ? draft.imageFit : ''
                }
            }
        };
    }

    return {
        ...base,
        data: {
            title: draft.title.trim(),
            subtitle: draft.subtitle.trim(),
            note: draft.note.trim(),
            url: draft.url.trim(),
            image: draft.image.trim(),
            imageFit: draft.imageFit,
            gradient: draft.gradient.trim(),
            price: numberOrNull(draft.price),
            oldPrice: numberOrNull(draft.oldPrice),
            promoEndDate: draft.promoEndDate.trim()
        }
    };
};

export const bannerProblem = (draft) => {
    if (draft.type === 'product') {
        if (numberOrNull(draft.productId) === null) return 'Выберите товар';
        return null;
    }

    if (!draft.title.trim()) return 'Без заголовка баннер выйдет пустым';
    if (draft.url.trim() && !/^https?:\/\//i.test(draft.url.trim())) {
        return 'Ссылка должна начинаться с http:// или https://';
    }

    if (!draft.image.trim() && !draft.gradient.trim()) return 'Нужна картинка или градиент';

    const price = numberOrNull(draft.price);
    const oldPrice = numberOrNull(draft.oldPrice);
    if (price !== null && oldPrice !== null && oldPrice <= price) {
        return 'Старая цена должна быть больше новой, иначе скидки не видно';
    }

    return null;
};

export const bannerTitle = (banner) => {
    const data = banner?.data || {};
    return text(data.override?.title) || text(data.title) || `Баннер №${banner?.id ?? ''}`;
};

export const bannerScope = (banner, pages) => {
    if (banner.pageId === null || banner.pageId === undefined) return 'Все витрины';

    return (pages || []).find((page) => page.id === banner.pageId)?.name || `Витрина №${banner.pageId}`;
};

export const sortBanners = (list) => (list || []).slice().sort((left, right) => {
    const order = (left.serialNumber ?? 0) - (right.serialNumber ?? 0);
    return order !== 0 ? order : (left.id ?? 0) - (right.id ?? 0);
});

export const moveBanner = (list, id, delta) => {
    const ordered = sortBanners(list);
    const from = ordered.findIndex((item) => item.id === id);
    const to = from + delta;

    if (from < 0 || to < 0 || to >= ordered.length) return null;

    const moved = ordered.slice();
    [moved[from], moved[to]] = [moved[to], moved[from]];

    return moved.map((item, index) => ({...item, serialNumber: index}));
};
