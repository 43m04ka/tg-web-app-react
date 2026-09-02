export const STATUS_TITLES = {
    new: 'Новый',
    awaiting_payment: 'Ждёт оплаты',
    paid: 'Оплачен',
    payment_failed: 'Оплата не прошла',
    completed: 'Выполнен',
    canceled: 'Отменён',
    refunded: 'Возврат',
};

export const STATUS_TONES = {
    new: 'neutral',
    awaiting_payment: 'warning',
    paid: 'positive',
    payment_failed: 'danger',
    completed: 'accent',
    canceled: 'neutral',
    refunded: 'neutral',
};

export const TRANSITIONS = {
    new: ['completed'],
    awaiting_payment: ['paid', 'payment_failed', 'canceled'],
    payment_failed: ['awaiting_payment', 'completed', 'canceled'],
    paid: ['completed'],
    completed: [],
    canceled: [],
    refunded: [],
};

export const TYPE_TITLES = {
    catalog: 'Каталог',
    steam_topup: 'Steam',
    code_order: 'Коды',
};

export const PAYOUT_TITLES = {
    none: 'не запускалась',
    processing: 'идёт',
    success: 'зачислено',
    error: 'ошибка',
};

export const PAYOUT_TONES = {
    none: 'neutral',
    processing: 'warning',
    success: 'positive',
    error: 'danger',
};

export const PLATFORM_TITLES = {
    tg: 'Telegram',
    web: 'Сайт',
    vk: 'VK',
    max: 'MAX',
};

export const PAYMENT_TITLES = {
    sbp: 'СБП',
    split: 'Сплит',
    dolyami: 'Долями',
};

export const statusTitle = (status) => STATUS_TITLES[status] || status || '—';
export const statusTone = (status) => STATUS_TONES[status] || 'neutral';

export const isTransitionKnown = (from, to) => (TRANSITIONS[from] || []).includes(to);

export const needsAttention = (order) => {
    if (!order) return false;
    if (order.payoutStatus === 'error') return true;
    if (order.status === 'paid' && order.type !== 'steam_topup') return true;
    return false;
};
