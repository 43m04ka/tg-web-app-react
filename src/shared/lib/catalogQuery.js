export const LIST_KEYS = ['platform', 'type', 'genre', 'language', 'numberPlayers'];

export const FILTER_GROUPS = [
    {key: 'platform', title: 'Платформа', icon: 'platform'},
    {key: 'type', title: 'Тип продукта', icon: 'type'},
    {key: 'genre', title: 'Жанры', icon: 'genre', limit: 10},
    {key: 'language', title: 'Локализация', icon: 'language', limit: 8},
    {key: 'numberPlayers', title: 'Количество игроков', icon: 'players', limit: 8}
];

export const TOGGLES = [
    {key: 'onlyDiscount', label: 'Только со скидкой'},
    {key: 'preorder', label: 'Доступно для предзаказа'}
];

export const SORTINGS = [
    {key: 'default', label: 'По умолчанию'},
    {key: 'discount', label: 'Скидка ↓'},
    {key: 'priceAsc', label: 'Цена ↑'},
    {key: 'priceDesc', label: 'Цена ↓'},
    {key: 'new', label: 'Новинки'},
    {key: 'rating', label: 'Рейтинг'},
    {key: 'alphabet', label: 'По алфавиту'}
];

export const PRICE_PRESETS = [
    {label: 'до 1 000', priceMin: null, priceMax: 1000},
    {label: '1 000 — 3 000', priceMin: 1000, priceMax: 3000},
    {label: '3 000+', priceMin: 3000, priceMax: null}
];

export const EMPTY_FILTERS = Object.freeze({
    platform: [],
    type: [],
    genre: [],
    language: [],
    numberPlayers: [],
    priceMin: null,
    priceMax: null,
    onlyDiscount: false,
    preorder: false
});

export const createFilters = (patch = {}) => ({
    ...EMPTY_FILTERS,
    ...patch,
    ...LIST_KEYS.reduce((lists, key) => {
        lists[key] = [...(patch[key] || [])];
        return lists;
    }, {})
});

export const toggleListValue = (filters, key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

    return {...filters, [key]: next};
};

export const setPriceRange = (filters, priceMin, priceMax) => ({...filters, priceMin, priceMax});

export const toggleFlag = (filters, key) => ({...filters, [key]: !filters[key]});

export const countActiveFilters = (filters) => {
    if (!filters) return 0;

    let count = LIST_KEYS.reduce((sum, key) => sum + ((filters[key] || []).length ? 1 : 0), 0);

    if (filters.priceMin !== null || filters.priceMax !== null) count += 1;
    if (filters.onlyDiscount) count += 1;
    if (filters.preorder) count += 1;

    return count;
};

export const hasActiveFilters = (filters) => countActiveFilters(filters) > 0;

const priceLabel = (priceMin, priceMax) => {
    const format = (value) => Number(value).toLocaleString('ru-RU');

    if (priceMin !== null && priceMax !== null) return `${format(priceMin)} — ${format(priceMax)} ₽`;
    if (priceMax !== null) return `до ${format(priceMax)} ₽`;
    if (priceMin !== null) return `от ${format(priceMin)} ₽`;
    return null;
};

const TYPE_LABELS = {
    GAME: 'Игра',
    ADD_ON: 'DLC',
    COMPLECT: 'Комплект',
    BUNDLE: 'Комплект',
    DONATION: 'Донат',
    SUBSCRIPTION: 'Подписка',
    CODE: 'Код',
    OTHER: 'Другое'
};

const playersLabel = (value) => {
    const range = String(value).match(/^(\d+)\s*[-–—]\s*(\d+)$/);
    if (range) return `${range[1]}–${range[2]} игрока`;

    if (/^\d+$/.test(value)) {
        return Number(value) === 1 ? '1 игрок' : `${value} игроков`;
    }

    return value;
};

export const optionLabel = (key, option) => {
    if (key === 'type') return TYPE_LABELS[option.value] || option.label || option.value;
    if (key === 'numberPlayers') return playersLabel(option.value);

    return option.label || option.value;
};

const labelOf = (facets, key, value) => {
    const option = (facets?.[key] || []).find((item) => item.value === value);
    return optionLabel(key, option || {value});
};

export const describeFilters = (filters, facets) => {
    if (!filters) return [];

    const chips = LIST_KEYS.flatMap((key) => (filters[key] || []).map((value) => ({
        id: `${key}:${value}`,
        label: labelOf(facets, key, value),
        remove: (current) => toggleListValue(current, key, value)
    })));

    const price = priceLabel(filters.priceMin, filters.priceMax);
    if (price) {
        chips.push({
            id: 'price',
            label: price,
            remove: (current) => setPriceRange(current, null, null)
        });
    }

    TOGGLES.forEach(({key, label}) => {
        if (!filters[key]) return;
        chips.push({id: key, label, remove: (current) => toggleFlag(current, key)});
    });

    return chips;
};

export const sortingLabel = (key) => SORTINGS.find((item) => item.key === key)?.label || SORTINGS[0].label;

export const isSamePriceRange = (filters, preset) =>
    filters.priceMin === preset.priceMin && filters.priceMax === preset.priceMax;

export const productsPlural = (count) => {
    const tail = count % 10;
    const hundred = count % 100;
    if (tail === 1 && hundred !== 11) return 'товар';
    if (tail >= 2 && tail <= 4 && (hundred < 12 || hundred > 14)) return 'товара';
    return 'товаров';
};
