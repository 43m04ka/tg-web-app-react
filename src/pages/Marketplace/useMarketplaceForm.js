import {useState} from 'react';
import {getTelegramObject} from '../../shared/lib/telegram';
import {sendMarketplaceOrder} from '../../shared/api/marketplaceOrder';

export const MARKETPLACES = ['Ozon', 'Wildberries', 'Яндекс Маркет', 'МегаМаркет', 'Avito', 'Другой'];

export const FIELDS = [
    {key: 'orderNumber', title: 'Номер заказа', placeholder: 'Например, 0472-XXXX', required: true},
    {key: 'orderDate', title: 'Дата заказа', type: 'date', required: true},
    {key: 'product', title: 'Что заказали', placeholder: 'Например, PS Plus Extra 3 мес', required: true, wide: true},
    {key: 'name', title: 'Имя', placeholder: 'Как к вам обращаться', required: true},
    {key: 'contact', title: 'Telegram / e-mail / телефон', placeholder: '@username', required: true},
    {key: 'accountData', title: 'Данные для активации', placeholder: 'Логин/ID аккаунта PSN или Xbox', multiline: true, required: true},
    {key: 'comment', title: 'Комментарий', placeholder: 'Необязательно', multiline: true}
];

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const initialForm = () => {
    const username = getTelegramObject().initDataUnsafe?.user?.username;

    return {
        marketplace: '',
        orderNumber: '',
        orderDate: '',
        product: '',
        name: '',
        contact: username ? `@${username}` : '',
        accountData: '',
        comment: ''
    };
};

const readFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
});

export function useMarketplaceForm() {
    const [form, setForm] = useState(initialForm);
    const [file, setFile] = useState(null);
    const [isAgreed, setAgreed] = useState(false);
    const [isTouched, setTouched] = useState(false);
    const [isSending, setSending] = useState(false);
    const [isDone, setDone] = useState(false);
    const [error, setError] = useState('');

    const isMissing = (key) => !form[key].trim();
    const isBad = (key) => isTouched && FIELDS.some((field) => field.key === key && field.required) && isMissing(key);

    const isReady = Boolean(form.marketplace)
        && FIELDS.every((field) => !field.required || !isMissing(field.key))
        && isAgreed;

    const blockReason = !isTouched || isReady
        ? null
        : !form.marketplace
            ? 'Выберите маркетплейс'
            : FIELDS.some((field) => field.required && isMissing(field.key))
                ? 'Заполните обязательные поля'
                : 'Подтвердите согласие на обработку данных';

    const update = (key, value) => setForm((current) => ({...current, [key]: value}));

    const pickFile = (picked) => {
        if (picked && picked.size > MAX_FILE_BYTES) {
            setError('Файл больше 10 МБ');
            return;
        }

        setError('');
        setFile(picked || null);
    };

    const submit = async () => {
        setTouched(true);

        if (!isReady || isSending) return false;

        setSending(true);
        setError('');

        try {
            const attached = file
                ? {name: file.name, type: file.type, data: await readFile(file)}
                : null;

            const result = await sendMarketplaceOrder({...form, agree: true, file: attached});

            if (!result.ok) {
                setError(typeof result.error === 'string' && result.httpStatus < 500
                    ? result.error
                    : 'Не удалось отправить заявку. Попробуйте ещё раз.');
                return false;
            }

            setDone(true);
            return true;
        } catch (requestError) {
            setError('Нет связи с сервером. Попробуйте ещё раз.');
            return false;
        } finally {
            setSending(false);
        }
    };

    const reset = () => {
        setForm(initialForm());
        setFile(null);
        setAgreed(false);
        setTouched(false);
        setDone(false);
    };

    return {
        form, file, isAgreed, isTouched, isSending, isDone, isReady, error, blockReason,
        isBad, update, pickFile, setAgreed, submit, reset
    };
}
