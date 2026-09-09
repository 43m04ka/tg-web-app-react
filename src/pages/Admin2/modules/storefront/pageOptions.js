export const TYPE_OPTIONS = [
    {value: 'ps', title: 'PlayStation'},
    {value: 'xbox', title: 'Xbox'},
    {value: 'ps_india', title: 'PlayStation Индия'},
    {value: 'steam', title: 'Steam'},
    {value: 'services', title: 'Сервисы'},
    {value: 'other', title: 'Без полей'},
];

export const BOT_OPTIONS = [
    {value: 'tg', title: 'Telegram'},
    {value: 'vk-xbox', title: 'VK Xbox'},
    {value: 'vk-ps', title: 'VK PS'},
    {value: 'web', title: 'Веб'},
    {value: 'test', title: 'Тест'},
];

export const TYPES_WITHOUT_STRUCTURE = ['steam', 'services'];

export const hasStructure = (type) => !TYPES_WITHOUT_STRUCTURE.includes(type);

export const PRICING_NOTES = {
    ps_india: 'Цены пересчитываются из рупий по своей сетке.',
    steam: 'Отдельный поток заказа: пополнение баланса, а не покупка позиций.',
    services: 'Оплата как у PlayStation и Xbox, но витрина собирается брендами, а не блоками.',
};

export const typeName = (value) => TYPE_OPTIONS.find((option) => option.value === value)?.title || value || '—';

export const botName = (value) => BOT_OPTIONS.find((option) => option.value === value)?.title || value || '—';

export const sortPages = (list) => (list || []).slice().sort((left, right) => {
    const bot = String(left.botType || '').localeCompare(String(right.botType || ''));
    if (bot !== 0) return bot;

    return (left.serialNumber ?? 0) - (right.serialNumber ?? 0);
});

export const groupByBot = (pages) => {
    const buckets = new Map();

    sortPages(pages).forEach((page) => {
        const key = page.botType || 'tg';
        const bucket = buckets.get(key);
        if (bucket) bucket.push(page);
        else buckets.set(key, [page]);
    });

    return [...buckets.entries()].map(([botType, items]) => ({botType, title: botName(botType), items}));
};
