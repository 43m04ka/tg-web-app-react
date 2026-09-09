export const TEXT_LIMIT = 4096;
export const CAPTION_LIMIT = 1024;
export const FILE_LIMIT_BYTES = 50 * 1024 * 1024;
export const SCHEDULE_AHEAD_DAYS = 30;

export const BUTTON_TYPES = [
    {value: 'url', title: 'Ссылка'},
    {value: 'web_app', title: 'Мини-приложение'},
    {value: 'callback_data', title: 'Ответ боту'},
    {value: 'switch_inline_query', title: 'Поделиться в чат'},
    {value: 'switch_inline_query_current_chat', title: 'Поделиться здесь'}
];

export const STATE_TITLES = {
    idle: 'Свободно',
    scheduled: 'Запланирована',
    running: 'Идёт отправка'
};

export const STATE_TONES = {
    idle: 'positive',
    scheduled: 'warning',
    running: 'accent'
};

export const nextId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const emptyDraft = () => ({
    captionHtml: '',
    media: null,
    keyboardRows: []
});

export const emptyButton = () => ({
    id: nextId(),
    text: '',
    actionType: 'url',
    url: '',
    webAppUrl: '',
    callback_data: '',
    switch_inline_query: '',
    switch_inline_query_current_chat: ''
});

export const emptyRow = () => ({id: nextId(), buttons: [emptyButton()]});

export const utf8Length = (value) => new TextEncoder().encode(String(value || '')).length;

export const isVideo = (file) => Boolean(file?.type?.startsWith('video/'));

export const isAllowedMedia = (file) =>
    Boolean(file?.type) && (file.type.startsWith('image/') || file.type.startsWith('video/'));

export const mediaError = (file) => {
    if (!file) return null;
    if (!isAllowedMedia(file)) return 'Только изображение или видео';
    if (file.size > FILE_LIMIT_BYTES) return 'Файл тяжелее 50 МБ — Telegram не примет';

    return null;
};

export const limitFor = (hasMedia, limits) => (hasMedia
    ? limits?.captionHtmlMaxChars ?? CAPTION_LIMIT
    : limits?.messageHtmlMaxChars ?? TEXT_LIMIT);

export const buttonToApi = (button) => {
    const text = String(button.text || '').trim();
    if (!text || text.length > 256) return null;

    switch (button.actionType) {
        case 'url': {
            const url = String(button.url || '').trim();
            if (!url || url.length > 2048) return null;
            if (!/^(https?:\/\/|tg:\/\/)/i.test(url)) return null;
            return {text, url};
        }
        case 'web_app': {
            const url = String(button.webAppUrl || '').trim();
            if (!url || !/^https:\/\//i.test(url)) return null;
            return {text, web_app: {url}};
        }
        case 'callback_data': {
            const data = String(button.callback_data || '').trim();
            if (!data || utf8Length(data) > 64) return null;
            return {text, callback_data: data};
        }
        case 'switch_inline_query':
            return {text, switch_inline_query: String(button.switch_inline_query ?? '')};
        case 'switch_inline_query_current_chat':
            return {
                text,
                switch_inline_query_current_chat: String(button.switch_inline_query_current_chat ?? '')
            };
        default:
            return null;
    }
};

export const buttonProblem = (button) => {
    const text = String(button.text || '').trim();
    if (!text) return 'Без подписи кнопка не отправится';
    if (text.length > 256) return 'Подпись длиннее 256 знаков';

    switch (button.actionType) {
        case 'url': {
            const url = String(button.url || '').trim();
            if (!url) return 'Укажите адрес';
            if (!/^(https?:\/\/|tg:\/\/)/i.test(url)) return 'Адрес должен начинаться с http://, https:// или tg://';
            if (url.length > 2048) return 'Адрес длиннее 2048 знаков';
            return null;
        }
        case 'web_app': {
            const url = String(button.webAppUrl || '').trim();
            if (!url) return 'Укажите адрес мини-приложения';
            if (!/^https:\/\//i.test(url)) return 'Мини-приложение открывается только по https://';
            return null;
        }
        case 'callback_data': {
            const data = String(button.callback_data || '').trim();
            if (!data) return 'Укажите, что бот получит в ответ';
            if (utf8Length(data) > 64) return 'Ответ длиннее 64 байт в UTF-8';
            return null;
        }
        default:
            return null;
    }
};

export const buildKeyboard = (rows) => {
    const out = (rows || [])
        .map((row) => (row.buttons || []).map(buttonToApi).filter(Boolean))
        .filter((row) => row.length > 0);

    return out.length ? out : null;
};

export const countButtons = (rows) =>
    (rows || []).reduce((sum, row) => sum + (row.buttons || []).length, 0);

export const keyboardProblem = (rows, limits) => {
    const filled = (rows || []).flatMap((row) => (row.buttons || []))
        .filter((button) => String(button.text || '').trim() || button.url || button.callback_data || button.webAppUrl);

    for (const button of filled) {
        const problem = buttonProblem(button);
        if (problem) return `Кнопка «${String(button.text || 'без подписи').slice(0, 24)}»: ${problem}`;
    }

    const built = buildKeyboard(rows);
    if (!built) return null;

    const maxButtons = limits?.inlineKeyboard?.maxButtonsTotal ?? 100;
    const total = built.reduce((sum, row) => sum + row.length, 0);
    if (total > maxButtons) return `Кнопок больше, чем разрешено: ${total} из ${maxButtons}`;

    return null;
};

export const scheduleProblem = (value) => {
    if (!value) return null;

    const parsed = Date.parse(value);
    if (!Number.isFinite(parsed)) return 'Не разобрали дату';
    if (parsed < Date.now() - 60 * 1000) return 'Это время уже прошло';
    if (parsed > Date.now() + SCHEDULE_AHEAD_DAYS * 24 * 60 * 60 * 1000) {
        return `Отложить можно максимум на ${SCHEDULE_AHEAD_DAYS} дней`;
    }

    return null;
};

export const readyToSend = ({textLength, limit, media, keyboardRows, schedule, limits}) => {
    if (textLength === 0 && !media) return 'Пустое сообщение отправлять нечего';
    if (textLength > limit) return `Текст длиннее ${limit} знаков`;

    const badMedia = mediaError(media);
    if (badMedia) return badMedia;

    const badKeyboard = keyboardProblem(keyboardRows, limits);
    if (badKeyboard) return badKeyboard;

    return scheduleProblem(schedule);
};

export const recipientsTitle = (count) => {
    const number = Number(count) || 0;
    const tail = number % 10;
    const hundred = number % 100;

    if (tail === 1 && hundred !== 11) return `${number.toLocaleString('ru-RU')} получатель`;
    if (tail >= 2 && tail <= 4 && (hundred < 12 || hundred > 14)) {
        return `${number.toLocaleString('ru-RU')} получателя`;
    }

    return `${number.toLocaleString('ru-RU')} получателей`;
};
