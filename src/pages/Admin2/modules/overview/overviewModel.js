export const RANGES = [
    {id: '7', title: '7 дней', days: 7},
    {id: '30', title: '30 дней', days: 30},
    {id: '90', title: '90 дней', days: 90}
];

export const TYPE_TITLES = {
    catalog: 'Каталог',
    steam_topup: 'Steam',
    code_order: 'Коды'
};

export const PLATFORM_TITLES = {
    tg: 'Telegram',
    web: 'Сайт',
    vk: 'VK',
    max: 'MAX'
};

const MOSCOW_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const moscowDay = (value) => {
    const time = value instanceof Date ? value.getTime() : Date.parse(value);
    if (!Number.isFinite(time)) return null;

    return new Date(time + MOSCOW_OFFSET_MS).toISOString().slice(0, 10);
};

export const rangeQuery = (days, now = new Date()) => {
    const to = moscowDay(now);
    const from = moscowDay(new Date(Date.parse(`${to}T00:00:00.000Z`) - (days - 1) * DAY_MS));

    return {from, to};
};

export const dayLabel = (day) => {
    const parts = String(day || '').split('-');
    return parts.length === 3 ? `${parts[2]}.${parts[1]}` : day;
};

const measured = (value) => {
    if (value === null || value === undefined || value === '') return null;

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

export const percentTitle = (share) => {
    const value = measured(share);
    return value === null ? '—' : `${Math.round(value * 100)}%`;
};

export const moneyTitle = (value) => {
    const number = measured(value);
    return number === null ? '—' : `${number.toLocaleString('ru-RU')} ₽`;
};

export const barHeights = (byDay, field = 'revenue') => {
    const rows = Array.isArray(byDay) ? byDay : [];
    const top = rows.reduce((max, row) => Math.max(max, Number(row[field]) || 0), 0);

    return rows.map((row) => {
        const value = Number(row[field]) || 0;
        return {
            ...row,
            value,
            height: top > 0 ? Math.max(2, Math.round((value / top) * 100)) : 2
        };
    });
};

export const attentionRows = (attention) => [
    {
        id: 'paidNotCompleted',
        title: 'Оплачены, но не выполнены',
        count: attention?.paidNotCompleted ?? 0,
        note: 'Деньги получены, покупатель ждёт выдачи',
        filter: 'status=paid',
        alarming: true
    },
    {
        id: 'payoutErrors',
        title: 'Ошибки выплат Steam',
        count: attention?.payoutErrors ?? 0,
        note: 'Баланс не пополнился, нужна ручная выплата',
        filter: 'trouble=yes',
        alarming: true
    },
    {
        id: 'paidWithoutContact',
        title: 'Оплачены без контакта',
        count: attention?.paidWithoutContact ?? 0,
        note: 'Некуда отправить выдачу',
        filter: 'trouble=yes',
        alarming: true
    },
    {
        id: 'awaitingPayment',
        title: 'Ждут оплаты',
        count: attention?.awaitingPayment ?? 0,
        note: 'Счёт выставлен, денег пока нет',
        filter: 'status=awaiting_payment',
        alarming: false
    }
];

export const alarmCount = (attention) => attentionRows(attention)
    .filter((row) => row.alarming)
    .reduce((sum, row) => sum + row.count, 0);
