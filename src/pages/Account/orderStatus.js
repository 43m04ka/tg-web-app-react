import {positionsPlural, rupees} from '../Basket/cartModel';

// Подписи статусов заказа для покупателя. Служебные названия из БД показывать нельзя:
// «paid» и «completed» для него — одно и то же «всё хорошо», а разница между ними
// внутренняя (деньги пришли / админ выдал).
export const STATUS_LABELS = {
    new: {label: 'В обработке', tone: 'info'},
    awaiting_payment: {label: 'Ожидает оплаты', tone: 'wait'},
    paid: {label: 'Оплачен', tone: 'ok'},
    completed: {label: 'Выполнен', tone: 'ok'},
    payment_failed: {label: 'Не оплачен', tone: 'fail'},
    canceled: {label: 'Отменён', tone: 'fail'},
    refunded: {label: 'Возврат', tone: 'fail'}
};

const OPEN_STATUSES = ['new', 'awaiting_payment', 'paid'];

export const statusOf = (order) => STATUS_LABELS[order?.status] || {label: 'В обработке', tone: 'info'};

export const isOpenOrder = (order) => OPEN_STATUSES.includes(order?.status);

export const orderNumber = (order) => `№ ${order.id}`;

export const isSteamOrder = (order) => order?.type === 'steam_topup';

export const orderItems = (order) => (order?.positions || []).flatMap((position) => {
    const nested = position.meta?.items || [];

    if (nested.length) {
        return nested.map((item) => ({name: item.name, quantity: Number(item.quantity) || 1}));
    }

    return [{name: position.name, quantity: Number(position.quantity) || 1}];
});

export const orderTopup = (order) => (order?.positions || []).find((position) => position.priceRs) || null;

export const orderTitle = (order) => {
    if (isSteamOrder(order)) return 'Пополнение Steam';
    return orderItems(order)[0]?.name || `Заказ ${orderNumber(order)}`;
};

export const orderCoverLetter = (order) => {
    if (isSteamOrder(order)) return 'S';
    return (orderItems(order)[0]?.name || '?').slice(0, 1).toUpperCase();
};

export const formatMoney = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return '';
    return `${number.toLocaleString('ru-RU')} ₽`;
};

export const formatOrderDate = (value) => {
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) return '';

    const date = new Date(parsed);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) return 'сегодня';

    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        ...(date.getFullYear() === now.getFullYear() ? {} : {year: 'numeric'})
    });
};

// Вторая строка карточки. У позиций нет картинки товара, зато в meta лежит платформа —
// её и показываем, добивая витриной и количеством позиций.
export const positionMeta = (order) => {
    if (order.type === 'steam_topup') {
        return [order.steamLogin, 'зачисление 5–15 мин'].filter(Boolean).join(' · ');
    }

    const positions = order.positions || [];
    const items = orderItems(order);
    const topup = orderTopup(order);
    const extra = items.length > 1 ? `${items.length} ${positionsPlural(items.length)}` : null;
    const lead = topup ? `Пополнение ${rupees(topup.priceRs)}` : positions[0]?.meta?.platform;

    return [lead, order.pageTitle, extra].filter(Boolean).join(' · ');
};
