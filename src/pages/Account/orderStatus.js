// Подписи статусов заказа для покупателя. Служебные названия из БД показывать нельзя:
// «paid» и «completed» для него — одно и то же «всё хорошо», а разница между ними
// внутренняя (деньги пришли / админ выдал).
export const STATUS_LABELS = {
    new: {label: 'В обработке', tone: 'wait'},
    awaiting_payment: {label: 'Ждёт оплаты', tone: 'wait'},
    paid: {label: 'Оплачен', tone: 'ok'},
    completed: {label: 'Готов', tone: 'ok'},
    payment_failed: {label: 'Не оплачен', tone: 'fail'},
    canceled: {label: 'Отменён', tone: 'fail'},
    refunded: {label: 'Возврат', tone: 'fail'}
};

export const statusOf = (order) => STATUS_LABELS[order?.status] || {label: 'В обработке', tone: 'wait'};

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
    const sameYear = date.getFullYear() === now.getFullYear();

    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        ...(sameYear ? {} : {year: 'numeric'})
    });
};

export const orderTitle = (order) => {
    if (order.type === 'steam_topup') return 'Пополнение Steam';

    const positions = order.positions || [];
    if (!positions.length) return `Заказ №${order.id}`;
    if (positions.length === 1) return positions[0].name;

    return `${positions[0].name} и ещё ${positions.length - 1}`;
};
