export const SPLIT_MIN_TOTAL = 2000;

export const pageCartItems = (items, catalogs, pageId) => {
    if (!Array.isArray(items)) return null;
    if (!Array.isArray(catalogs)) return items;

    const pageCatalogs = new Set(
        catalogs.filter((catalog) => catalog.structurePageId === pageId).map((catalog) => catalog.id)
    );

    if (pageCatalogs.size === 0) return items;

    return items.filter((item) => pageCatalogs.has(item.catalogId));
};

export const PAYMENT_METHODS = [
    {
        key: 'sbp',
        title: 'СБП',
        note: 'Оплата с помощью Системы быстрых платежей',
        tone: 'sbp',
        icon: 'sbp',
        isOnline: true
    },
    {
        key: 'split',
        title: 'Яндекс Сплит',
        note: 'Яндекс Сплит — это сервис от Яндекса для оплаты покупок частями',
        tone: 'split',
        icon: 'split',
        minTotal: SPLIT_MIN_TOTAL,
        schedule: true,
        terms: {label: 'Условия сервиса', url: 'https://yandex.ru/legal/yandexpay_b2c/'}
    },
    {
        key: 'dolyami',
        title: 'Долями',
        note: '«Долями» — это сервис оплаты покупок частями от Т‑Банка',
        tone: 'dolyami',
        icon: 'dolyami',
        minTotal: SPLIT_MIN_TOTAL,
        schedule: true,
        terms: {label: 'Условия сервиса', url: 'https://dolyame.ru/'}
    }
];

export const findMethod = (key) => PAYMENT_METHODS.find((method) => method.key === key) || PAYMENT_METHODS[0];

export const isMethodAvailable = (method, total) => !method.minTotal || total >= method.minTotal;

const SCHEDULE_STEP_DAYS = 14;
const SCHEDULE_PARTS = 4;

export const splitSchedule = (total) => {
    const part = Math.round(total / SCHEDULE_PARTS);
    const today = new Date();

    return Array.from({length: SCHEDULE_PARTS}, (_, index) => {
        const date = new Date(today);
        date.setDate(date.getDate() + index * SCHEDULE_STEP_DAYS);

        return {
            amount: index === SCHEDULE_PARTS - 1 ? total - part * (SCHEDULE_PARTS - 1) : part,
            label: index === 0 ? 'сегодня' : date.toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})
        };
    });
};

export const ACCOUNT_KINDS = {NEW: 'new', OWN: 'own'};

const PSN_FIELDS = [
    {key: 'login', label: 'Логин от аккаунта PSN', placeholder: 'Логин от аккаунта PSN'},
    {key: 'password', label: 'Пароль от аккаунта PSN', placeholder: 'Пароль от аккаунта PSN'},
    {key: 'code1', label: 'Код #1', placeholder: 'Код #1', maxLength: 6, short: true},
    {key: 'code2', label: 'Код #2', placeholder: 'Код #2', maxLength: 6, short: true},
    {key: 'code3', label: 'Код #3', placeholder: 'Код #3', maxLength: 6, short: true}
];

const XBOX_FIELDS = [
    {key: 'login', label: 'Логин от аккаунта Xbox', placeholder: 'Логин от аккаунта Xbox'},
    {key: 'password', label: 'Пароль от аккаунта Xbox', placeholder: 'Пароль от аккаунта Xbox'},
    {key: 'mail', label: 'Резервная почта', placeholder: 'Резервная почта'},
    {key: 'phone', label: 'Резервный телефон', placeholder: 'Телефон'}
];

const PSN_ACCOUNT = {
    service: 'PSN',
    fields: PSN_FIELDS,
    newHint: 'Оформим заказ на новый аккаунт PSN и передадим его вам в полном доступе. Аккаунт будет принадлежать только вам, это бесплатно.',
    ownHint: 'Введите данные аккаунта PSN и три резервных кода — без них войти в аккаунт не получится.',
    guide: {label: 'Где взять резервные коды', url: 'https://t.me/gwstore_faq/10'}
};

const XBOX_ACCOUNT = {
    service: 'Xbox',
    fields: XBOX_FIELDS,
    newHint: 'Оформим заказ на новый аккаунт Xbox и передадим его вам в полном доступе. Это бесплатно.',
    ownHint: 'Введите логин и пароль от аккаунта Xbox, а также резервную почту или телефон — на них придёт код для входа.',
    guide: {label: 'Если резервный контакт не настроен', url: 'https://t.me/gwstore_faq/9'}
};

const ACCOUNT_FORMS = {ps: PSN_ACCOUNT, ps_india: PSN_ACCOUNT, xbox: XBOX_ACCOUNT};

export const accountForm = (pageType) => ACCOUNT_FORMS[pageType] || null;

const valueOrDash = (value) => {
    const text = String(value || '').trim();
    return text === '' ? 'Не указано' : text;
};

export const buildAccountData = (pageType, kind, values) => {
    const form = accountForm(pageType);

    if (!form) return 'Аккаунт не требуется.';
    if (kind === ACCOUNT_KINDS.NEW) return `Нет своего аккаунта ${form.service}.`;

    if (form.service === 'PSN') {
        return [
            `Логин: ${valueOrDash(values.login)}`,
            `Пароль: ${valueOrDash(values.password)}`,
            `Резервные коды: ${valueOrDash(values.code1)}, ${valueOrDash(values.code2)}, ${valueOrDash(values.code3)}`
        ].join(' \n');
    }

    return [
        `Логин: ${valueOrDash(values.login)}`,
        `Пароль: ${valueOrDash(values.password)}`,
        `Резервная почта: ${valueOrDash(values.mail)}`,
        `Резервный телефон: ${valueOrDash(values.phone)}`
    ].join(' \n');
};

export const isAccountFilled = (pageType, kind, values) => {
    const form = accountForm(pageType);

    if (!form || kind === ACCOUNT_KINDS.NEW) return true;

    return Boolean(String(values.login || '').trim() && String(values.password || '').trim());
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmailValid = (email) => EMAIL_PATTERN.test(String(email || '').trim());

export const CONTACT_CHANNELS = [
    {
        key: 'telegram',
        title: 'Telegram',
        label: 'Ник в Telegram',
        placeholder: 'username',
        note: 'Только латиница, цифры и подчёркивание — без ссылки',
        error: 'Ник от 4 символов, без пробелов и точек'
    },
    {
        key: 'vk',
        title: 'VK',
        label: 'Страница ВКонтакте',
        placeholder: 'vk.com/durov',
        note: 'Ссылка на страницу или короткое имя',
        error: 'Похоже на неверную ссылку'
    },
    {
        key: 'email',
        title: 'Почта',
        label: 'Адрес почты',
        placeholder: 'mail@example.com',
        note: 'Ответим письмом на этот адрес',
        error: 'Проверьте адрес почты'
    },
    {
        key: 'phone',
        title: 'Телефон',
        label: 'Номер телефона',
        placeholder: '+7 999 000-00-00',
        note: 'Напишем в мессенджер по этому номеру',
        error: 'Номер из 10–15 цифр'
    }
];

export const findChannel = (key) => CONTACT_CHANNELS.find((channel) => channel.key === key) || CONTACT_CHANNELS[0];

const digitsOf = (value) => String(value || '').replace(/[^\d+]/g, '');

const VK_LINK = /^(https?:\/\/)?(m\.)?vk\.com\/[a-zA-Z0-9_.]{3,}$/;
const VK_NAME = /^[a-zA-Z0-9_.]{3,}$/;
const TELEGRAM_NAME = /^[a-zA-Z0-9_]{4,32}$/;
const PHONE = /^\+?\d{10,15}$/;

const stripAt = (value) => String(value || '').trim().replace(/^@+/, '');

export const isContactValid = (channelKey, value) => {
    const text = String(value || '').trim();
    if (text === '') return false;

    if (channelKey === 'telegram') return TELEGRAM_NAME.test(stripAt(text));
    if (channelKey === 'vk') return VK_LINK.test(text) || VK_NAME.test(stripAt(text));
    if (channelKey === 'email') return isEmailValid(text);
    if (channelKey === 'phone') return PHONE.test(digitsOf(text));

    return text.length > 2;
};

export const contactHandle = (channelKey, value) => {
    const text = String(value || '').trim();

    if (channelKey === 'telegram') return stripAt(text);
    if (channelKey === 'vk') return VK_LINK.test(text) ? text : `https://vk.com/${stripAt(text)}`;
    if (channelKey === 'phone') return digitsOf(text);

    return text;
};

export const formatContact = (channelKey, value) => {
    const handle = contactHandle(channelKey, value);

    if (channelKey === 'telegram') return `Telegram: @${handle}`;
    if (channelKey === 'vk') return `VK: ${handle}`;
    if (channelKey === 'email') return `Почта: ${handle}`;
    if (channelKey === 'phone') return `Телефон: ${handle}`;

    return handle;
};

const FAQ_PSN = [
    {
        question: 'Нужен ли турецкий аккаунт?',
        answer: 'Нет. Если своего аккаунта нужного региона нет, отметьте «Новый аккаунт» — мы оформим покупку на новый PSN и передадим его вам полностью, бесплатно.'
    },
    {
        question: 'Как быстро придёт заказ?',
        answer: 'Обычно в течение 15–40 минут в рабочее время, 10:00–22:00 МСК. Если оформили ночью, менеджер ответит утром.'
    },
    {
        question: 'Что если оплата не прошла?',
        answer: 'Деньги не спишутся: неоплаченный счёт закрывается сам. Можно вернуться в корзину и оформить заказ заново или выбрать другой способ оплаты.'
    }
];

const FAQ_INDIA = [
    {
        question: 'Почему сумма кратна 1000 рупий?',
        answer: 'Баланс индийского PSN пополняется только фиксированными номиналами. Мы округляем сумму вверх до ближайшей тысячи рупий, а остаток остаётся на вашем аккаунте.'
    },
    {
        question: 'Куда денется остаток рупий?',
        answer: 'Он сохранится на балансе аккаунта и уйдёт в счёт следующей покупки — не сгорает.'
    },
    {
        question: 'Что если оплата не прошла?',
        answer: 'Деньги не спишутся: неоплаченный счёт закрывается сам. Можно вернуться в корзину и оформить заказ заново.'
    }
];

const FAQ_XBOX = [
    {
        question: 'Нужен ли аккаунт другого региона?',
        answer: 'Нет. Если своего аккаунта нет, отметьте «Новый аккаунт» — мы оформим покупку на новый Xbox-аккаунт и передадим его вам полностью, бесплатно.'
    },
    {
        question: 'Зачем резервная почта или телефон?',
        answer: 'На них Microsoft присылает код подтверждения входа. Без доступа к резервному контакту войти в аккаунт и выдать покупку не получится.'
    },
    {
        question: 'Что если оплата не прошла?',
        answer: 'Деньги не спишутся: неоплаченный счёт закрывается сам. Можно вернуться в корзину и оформить заказ заново.'
    }
];

const FAQ_DEFAULT = [
    {
        question: 'Как быстро придёт заказ?',
        answer: 'Обычно в течение 15–40 минут в рабочее время, 10:00–22:00 МСК. Если оформили ночью, менеджер ответит утром.'
    },
    {
        question: 'Что если оплата не прошла?',
        answer: 'Деньги не спишутся: неоплаченный счёт закрывается сам. Можно вернуться в корзину и оформить заказ заново.'
    }
];

const FAQ = {ps: FAQ_PSN, ps_india: FAQ_INDIA, xbox: FAQ_XBOX};

export const faqFor = (pageType) => FAQ[pageType] || FAQ_DEFAULT;

export const positionsPlural = (count) => {
    const tail = count % 10;
    const hundred = count % 100;

    if (tail === 1 && hundred !== 11) return 'товар';
    if (tail >= 2 && tail <= 4 && (hundred < 12 || hundred > 14)) return 'товара';

    return 'товаров';
};

export const money = (value) => `${Math.round(Number(value) || 0).toLocaleString('ru-RU')} ₽`;

export const rupees = (value) => `${Math.round(Number(value) || 0).toLocaleString('ru-RU')} ₹`;
