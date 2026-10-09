export const BANNER_TYPES = [
    {value: 'product', title: 'Товар'},
    {value: 'custom', title: 'Произвольный'}
];

export const IMAGE_FITS = [
    {value: 'banner', title: 'Целиком (картинка 4:3)'},
    {value: 'coverTop', title: 'Кадрировать сверху (обложка)'}
];

export const BANNER_SLOTS = [
    {value: 'main', title: 'Большой баннер (карусель)'},
    {value: 'side', title: 'Малый квадратный справа (карусель)'}
];

const DEVICE_VALUES = ['mobile', 'pc'];

const OTHER_DEVICE = {mobile: 'pc', pc: 'mobile'};

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
    promoEndDate: '',
    slot: 'main',
    device: 'mobile',
    shade: true,
    button1Label: '',
    button1Url: '',
    button2Label: '',
    button2Url: ''
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
        promoEndDate: text(data.promoEndDate),
        slot: data.slot === 'side' ? 'side' : 'main',
        device: DEVICE_VALUES.includes(data.device) ? data.device : 'mobile',
        shade: data.shade !== false,
        button1Label: text(data.buttons?.[0]?.label),
        button1Url: text(data.buttons?.[0]?.url),
        button2Label: text(data.buttons?.[1]?.label),
        button2Url: text(data.buttons?.[1]?.url)
    };
};

const draftButtons = (draft) => [
    {label: draft.button1Label.trim(), url: draft.button1Url.trim()},
    {label: draft.button2Label.trim(), url: draft.button2Url.trim()}
].filter((button) => button.label);

export const toPayload = (draft) => {
    const base = {
        pageId: draft.pageId === null || draft.pageId === '' ? null : Number(draft.pageId),
        type: draft.type,
        serialNumber: Number(draft.serialNumber) || 0,
        isHidden: draft.isHidden ? 1 : 0
    };

    const layout = {slot: draft.slot, device: draft.device, shade: Boolean(draft.shade), buttons: draftButtons(draft)};

    if (draft.type === 'product') {
        return {
            ...base,
            data: {
                productId: numberOrNull(draft.productId),
                subtitle: draft.subtitle.trim(),
                note: draft.note.trim(),
                url: draft.url.trim(),
                ...layout,
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
            ...layout,
            image: draft.image.trim(),
            imageFit: draft.imageFit,
            gradient: draft.gradient.trim(),
            price: numberOrNull(draft.price),
            oldPrice: numberOrNull(draft.oldPrice),
            promoEndDate: draft.promoEndDate.trim()
        }
    };
};

const isLink = (value) => !value || /^(https?:\/\/|\/)/i.test(value);

export const bannerProblem = (draft) => {
    if (!isLink(draft.button1Url.trim()) || !isLink(draft.button2Url.trim())) {
        return 'Ссылка кнопки должна начинаться с http://, https:// или /';
    }

    if ((draft.button1Url.trim() && !draft.button1Label.trim()) || (draft.button2Url.trim() && !draft.button2Label.trim())) {
        return 'У кнопки со ссылкой нужен текст';
    }

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

export const bannersFor = (list, pageId, device) => sortBanners(list).filter((banner) =>
    (banner.pageId === null || banner.pageId === pageId) && banner.data?.device !== OTHER_DEVICE[device]);

export const sortBanners = (list) => (list || []).slice().sort((left, right) => {
    const order = (left.serialNumber ?? 0) - (right.serialNumber ?? 0);
    return order !== 0 ? order : (left.id ?? 0) - (right.id ?? 0);
});

export const moveBanner = (list, id, delta, all = list) => {
    const visible = sortBanners(list);
    const from = visible.findIndex((item) => item.id === id);
    const to = from + delta;

    if (from < 0 || to < 0 || to >= visible.length) return null;

    const moved = sortBanners(all);
    const left = moved.findIndex((item) => item.id === visible[from].id);
    const right = moved.findIndex((item) => item.id === visible[to].id);

    if (left < 0 || right < 0) return null;

    [moved[left], moved[right]] = [moved[right], moved[left]];

    return moved.map((item, index) => ({...item, serialNumber: index}));
};
