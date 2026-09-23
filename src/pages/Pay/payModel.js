export const MIN_AMOUNT = 1;
export const MAX_AMOUNT = 1000000;

export const PENDING_KEY = 'pay:pending';

export const cleanAmount = (value) => {
    const text = String(value || '').replace(',', '.').replace(/[^\d.]/g, '');
    const [whole, ...rest] = text.split('.');
    const digits = whole.replace(/^0+(?=\d)/, '').slice(0, 7);

    if (rest.length === 0) return digits;

    return `${digits || '0'}.${rest.join('').slice(0, 2)}`;
};

export const parseAmount = (value) => {
    const amount = Number(String(value || '').replace(',', '.'));
    return Number.isFinite(amount) ? amount : NaN;
};

export const isAmountValid = (value) => {
    const amount = parseAmount(value);
    return amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
};

export const formatMoney = (value) => `${Number(value || 0).toLocaleString('ru-RU', {maximumFractionDigits: 2})} ₽`;

export const amountError = (value) => {
    if (String(value || '').trim() === '') return 'Впишите сумму из заказа';
    if (!isAmountValid(value)) return `Сумма от ${formatMoney(MIN_AMOUNT)} до ${formatMoney(MAX_AMOUNT)}`;

    return null;
};

export const readPending = () => {
    try {
        return JSON.parse(window.localStorage.getItem(PENDING_KEY) || 'null');
    } catch (error) {
        return null;
    }
};

export const writePending = (payment) => {
    try {
        if (payment) window.localStorage.setItem(PENDING_KEY, JSON.stringify(payment));
        else window.localStorage.removeItem(PENDING_KEY);
    } catch (error) {
        console.warn('[pay] localStorage:', error.message);
    }
};
