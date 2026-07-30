// Единый маппинг backend-статуса заказа (see tg-web-app-server/services/orders/orderStatus.js)
// на 3 пользовательские категории.
const STATUS_GROUPS = {
    paid: 'done',
    completed: 'done',
    new: 'progress',
    awaiting_payment: 'progress',
    canceled: 'canceled',
    refunded: 'canceled',
    payment_failed: 'canceled',
};

const GROUP_LABELS = {
    done: 'Выполнен',
    progress: 'В работе',
    canceled: 'Отменён',
};

export const getOrderStatusInfo = (status) => {
    const group = STATUS_GROUPS[status] || 'progress';
    return {group, label: GROUP_LABELS[group]};
};
