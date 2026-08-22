// Единый словарь статусов заказа — тот же набор, что services/orders/orderStatus.js
// на бэкенде (Models.Order.status). Порядок соответствует обычному жизненному циклу,
// не алфавиту — так проще ориентироваться в выпадающем списке.
export const STATUS_OPTIONS = [
    {key: 'new', name: 'Новый — ждёт менеджера'},
    {key: 'awaiting_payment', name: 'Счёт выставлен'},
    {key: 'paid', name: 'Оплачен'},
    {key: 'payment_failed', name: 'Не оплачен (счёт истёк)'},
    {key: 'completed', name: 'Выполнен'},
    {key: 'canceled', name: 'Отменён'},
    {key: 'refunded', name: 'Возврат'},
];

export const statusName = (status) => STATUS_OPTIONS.find((option) => option.key === status)?.name || status || '—';

// Группа определяет только цвет бейджа в списке/форме — на бизнес-логику не влияет.
const STATUS_TONE = {
    new: 'progress',
    awaiting_payment: 'progress',
    paid: 'done',
    completed: 'done',
    payment_failed: 'problem',
    canceled: 'problem',
    refunded: 'problem',
};

export const statusTone = (status) => STATUS_TONE[status] || 'progress';

export const TYPE_LABELS = {
    catalog: 'Каталог',
    steam_topup: 'Steam',
};

export const PAYMENT_METHOD_LABELS = {
    sbp: 'СБП',
    split: 'Сплит',
    dolyami: 'Долями',
};
