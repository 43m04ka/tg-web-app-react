export const POPULAR_PLATFORMS = [
    {value: 'tg', title: 'Telegram'},
    {value: 'vk-ps', title: 'VK PS'},
    {value: 'vk-xbox', title: 'VK Xbox'},
    {value: 'web', title: 'Веб'},
    {value: 'test', title: 'Тест'}
];

export const byPlatform = (list, platform) => (list || [])
    .filter((item) => item.platform === platform)
    .slice()
    .sort((left, right) => {
        const order = (left.serialNumber ?? 0) - (right.serialNumber ?? 0);
        return order !== 0 ? order : (left.id ?? 0) - (right.id ?? 0);
    });

export const movePopular = (list, id, delta) => {
    const ordered = list.slice();
    const from = ordered.findIndex((item) => item.id === id);
    const to = from + delta;

    if (from < 0 || to < 0 || to >= ordered.length) return null;

    [ordered[from], ordered[to]] = [ordered[to], ordered[from]];

    return ordered.map((item, index) => ({...item, serialNumber: index}));
};

export const popularTitle = (item) => item.product?.name || `Товар №${item.productId}`;

export const popularProblem = (item) => {
    if (!item.product) return 'Товар удалён';
    if (item.product.isHidden) return 'Товар скрыт';
    if (!item.product.onSale) return 'Снят с продажи';

    return null;
};

export const alreadyAdded = (list, platform, productId) =>
    (list || []).some((item) => item.platform === platform && item.productId === Number(productId));
