import {useState} from 'react';
import {getTelegramObject} from '../../shared/lib/telegram';
import {sendMarketplaceOrder} from '../../shared/api/marketplaceOrder';
import ozon from '../../shared/assets/marketplaces/ozon.png';
import wildberries from '../../shared/assets/marketplaces/wildberries.png';
import yandexMarket from '../../shared/assets/marketplaces/yandex-market.png';
import megamarket from '../../shared/assets/marketplaces/megamarket.png';
import avito from '../../shared/assets/marketplaces/avito.png';

export const MARKETPLACES = [
    {name: 'Ozon', logo: ozon},
    {name: 'Wildberries', logo: wildberries},
    {name: 'Яндекс Маркет', logo: yandexMarket},
    {name: 'МегаМаркет', logo: megamarket},
    {name: 'Avito', logo: avito},
    {name: 'Другой', logo: null}
];

export const ORDER_FIELDS = [
    {key: 'orderNumber', title: 'Номер заказа', placeholder: 'Например, 0472-XXXX'},
    {key: 'orderDate', title: 'Дата заказа', type: 'date'}
];

export const NAME_FIELD = {key: 'name', title: 'Ваше имя', placeholder: 'Как к вам обращаться'};

export const CONTACT_FIELDS = [
    {key: 'telegram', title: 'Telegram', placeholder: '@username'},
    {key: 'email', title: 'E-mail', placeholder: 'mail@example.com', type: 'email'},
    {key: 'phone', title: 'Телефон', placeholder: '+7 900 000-00-00', type: 'tel'}
];

export const SUPPORT_URL = 'https://t.me/gwstore_admin';

const REQUIRED = ['orderNumber', 'orderDate', 'name'];

const initialForm = () => {
    const username = getTelegramObject().initDataUnsafe?.user?.username;

    return {
        marketplace: '',
        orderNumber: '',
        orderDate: '',
        name: '',
        telegram: username ? `@${username}` : '',
        email: '',
        phone: ''
    };
};

export function useMarketplaceForm() {
    const [form, setForm] = useState(initialForm);
    const [isTouched, setTouched] = useState(false);
    const [isSending, setSending] = useState(false);
    const [isDone, setDone] = useState(false);
    const [error, setError] = useState('');

    const isMissing = (key) => !form[key].trim();
    const hasContact = CONTACT_FIELDS.some((field) => !isMissing(field.key));

    const isBad = (key) => isTouched && (REQUIRED.includes(key)
        ? isMissing(key)
        : CONTACT_FIELDS.some((field) => field.key === key) && !hasContact);

    const isReady = Boolean(form.marketplace) && REQUIRED.every((key) => !isMissing(key)) && hasContact;

    const blockReason = !isTouched || isReady
        ? null
        : !form.marketplace
            ? 'Выберите площадку'
            : REQUIRED.some(isMissing)
                ? 'Заполните обязательные поля'
                : 'Укажите хотя бы один способ связи';

    const update = (key, value) => setForm((current) => ({...current, [key]: value}));

    const submit = async () => {
        setTouched(true);

        if (!isReady || isSending) return false;

        setSending(true);
        setError('');

        try {
            const result = await sendMarketplaceOrder({...form, agree: true});

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

    return {form, isTouched, isSending, isDone, isReady, error, blockReason, isBad, update, submit};
}
