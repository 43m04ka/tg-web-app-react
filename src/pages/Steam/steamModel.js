export const MIN_AMOUNT = 100;
export const MAX_AMOUNT = 50000;

export const PRESETS = [100, 500, 1000];

export const CUSTOM_PRESET = 'custom';

export const STEAM_FAQ = [
    {
        question: 'Нужен ли доступ к аккаунту Steam?',
        answer: 'Нет. Достаточно логина для входа — пароль и код Steam Guard не нужны, баланс зачисляется по логину.'
    },
    {
        question: 'Какие страны можно пополнить?',
        answer: 'Россия, Казахстан, Беларусь, Армения, Грузия, Киргизия, Узбекистан, Азербайджан, Таджикистан. Кроме регионов: Крым, ЛНР и ДНР.'
    },
    {
        question: 'Лимиты и ограничения',
        answer: 'Минимальная сумма для всех способов зачисления — 100 рублей или 500 тенге. Лимит на максимальное пополнение баланса Steam на один логин за 24 часа — 500 $, и он распространяется на все способы пополнения: если вы уже пополняли Steam где-то ещё на 500 $, наше пополнение может не пройти. Аккаунты с блокировкой (красная табличка, КТ) пополнить нельзя.'
    },
    {
        question: 'У меня новый аккаунт или первое пополнение',
        answer: 'При первом пополнении валюта аккаунта может смениться на одну из списка ($, ₸, € и другие), страна аккаунта тоже изменится автоматически. Чтобы этого избежать и сохранить российский регион, перед пополнением добавьте в библиотеку Steam любую бесплатную игру, а лучше несколько (например, PUBG). Всё это нужно делать под русским IP-адресом.'
    },
    {
        question: 'Пришла сумма меньше',
        answer: 'Для пополнения мы конвертируем средства в разные валюты, поэтому изредка сумма может отличаться от указанной на 1–2 %.'
    },
    {
        question: 'Не пришли деньги на кошелёк',
        answer: 'Если вы верно указали логин (это не никнейм), а баланс аккаунта — рубли (₽) или тенге (₸), пополнение происходит моментально. Если средства не поступили в течение часа, обратитесь в нашу техподдержку.'
    },
    {
        question: 'Возврат средств',
        answer: 'Если требования к аккаунту не соблюдены, средства не дойдут. Если регион аккаунта Steam не Россия (рубли), Беларусь (белорусские рубли) или Казахстан (тенге), возврат невозможен по причине невозможности возврата денежных средств платёжной системой.'
    },
    {
        question: 'Что если оплата не прошла?',
        answer: 'Деньги не спишутся: неоплаченный счёт закрывается сам. Можно вернуться и оформить пополнение заново.'
    }
];

export const STEAM_LOGIN_PATTERN = /^[a-zA-Z0-9_-]{3,64}$/;

export const cleanAmount = (value) => String(value || '').replace(/\D/g, '').slice(0, 5);

export const cleanLogin = (value) => String(value || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);

export const isLoginValid = (value) => STEAM_LOGIN_PATTERN.test(String(value || '').trim());

export const isAmountValid = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) && amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
};

export const amountError = (value) => {
    if (String(value || '').trim() === '') return 'Укажите сумму пополнения';
    if (!isAmountValid(value)) return `Сумма от ${MIN_AMOUNT.toLocaleString('ru-RU')} до ${MAX_AMOUNT.toLocaleString('ru-RU')} ₽`;

    return null;
};

export const feeOf = (quote) => {
    if (!quote) return 0;
    return Math.max(0, Number(quote.total || 0) - Number(quote.topupAmount || 0));
};

export const feePercent = (quote) => {
    const topup = Number(quote?.topupAmount || 0);
    if (topup <= 0) return 0;

    return Math.round((feeOf(quote) / topup) * 100);
};

export const isUserFacingError = (message) => /[а-яё]/i.test(String(message || ''));

export const isLoginError = (message) => isUserFacingError(message) && /логин/i.test(String(message));
