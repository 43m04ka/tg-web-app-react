export const PLATFORM_OPTIONS = [
    {value: '', title: 'Площадка: любая'},
    {value: 'tg', title: 'Telegram'},
    {value: 'web', title: 'Сайт'},
    {value: 'vk', title: 'VK'}
];

export const SORT_OPTIONS = [
    {value: 'newest', title: 'Сначала новые'},
    {value: 'oldest', title: 'Сначала давние'}
];

export const PLATFORM_TITLES = {
    tg: 'Telegram',
    web: 'Сайт',
    vk: 'VK'
};

export const customerTitle = (customer) => {
    const name = String(customer?.username || '').trim();
    if (name) return name.startsWith('@') ? name : `@${name}`;

    return customer?.chatId ? `id ${customer.chatId}` : `Покупатель №${customer?.id ?? '—'}`;
};

export const moneyTitle = (value) => {
    if (value === null || value === undefined || value === '') return '—';

    const number = Number(value);
    return Number.isFinite(number) ? `${number.toLocaleString('ru-RU')} ₽` : '—';
};

export const dayTitle = (value) => {
    const time = Date.parse(value);
    return Number.isFinite(time) ? new Date(time).toLocaleDateString('ru-RU') : '—';
};

export const loyaltyTitle = (summary) => {
    const paid = Number(summary?.paidOrders) || 0;
    const all = Number(summary?.orders) || 0;

    if (all === 0) return 'Заказов не было';
    if (paid === 0) return 'Оформлял, но не платил';
    if (paid === 1) return 'Одна покупка';
    if (paid < 5) return 'Возвращается';

    return 'Постоянный';
};

export const loyaltyTone = (summary) => {
    const paid = Number(summary?.paidOrders) || 0;
    const all = Number(summary?.orders) || 0;

    if (all === 0) return 'neutral';
    if (paid === 0) return 'warning';
    if (paid >= 5) return 'positive';

    return 'accent';
};

export const conversionTitle = (summary) => {
    const all = Number(summary?.orders) || 0;
    if (all === 0) return '—';

    const paid = Number(summary?.paidOrders) || 0;
    return `${Math.round((paid / all) * 100)}%`;
};
