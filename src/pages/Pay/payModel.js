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

export const payBlockReason = (isEmailReady, amountText) => {
    const amount = amountError(amountText);

    if (!isEmailReady && amount) return 'Укажите почту для чека и сумму из заказа';
    if (!isEmailReady) return 'Укажите почту для чека';

    return amount;
};

export const canPasteAmount = () => typeof navigator !== 'undefined' && Boolean(navigator.clipboard?.readText);

export const readClipboardAmount = async () => {
    try {
        return cleanAmount(await navigator.clipboard.readText());
    } catch {
        return '';
    }
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

export const PAY_INFO = [
    'Это официальная оплата на расчетный счет ИП в Альфа Банк, а не перевод. Вы получите чек на электронную почту, которую укажете в форме оплаты.',
    'Если вписать сумму меньше и оплатить, заказ не будет считаться оплаченным.',
    'Оплачивая данный заказ Вы принимаете Пользовательское соглашение нашего сервиса.',
    'Обращаем внимание, что прием платежей в магазине Геймворд.рф осуществляется круглосуточно. Активация заказа происходит в рабочее время — с 10:00 до 22:00 по МСК ежедневно.'
];
