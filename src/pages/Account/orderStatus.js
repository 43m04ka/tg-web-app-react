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
    const extra = positions.length > 1 ? `${positions.length} позиции` : null;

    return [positions[0]?.meta?.platform, order.pageTitle, extra].filter(Boolean).join(' · ');
};
