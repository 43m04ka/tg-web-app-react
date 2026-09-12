export const TEXT_LIMIT = 4096;
export const CAPTION_LIMIT = 1024;
export const FILE_LIMIT_BYTES = 50 * 1024 * 1024;
export const SCHEDULE_AHEAD_DAYS = 30;

export const BOT_APP_URL = 'https://t.me/gwstore_bot/app';

export const MEDIA_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm'
];

export const MEDIA_ACCEPT = MEDIA_TYPES.join(',');

export const TARGETS = [
    {value: 'catalog', title: 'Каталог'},
    {value: 'product', title: 'Игра'},
    {value: 'url', title: 'Своя ссылка'}
];

export const STATE_TITLES = {
    idle: 'Свободно',
    scheduled: 'Запланирована',
    running: 'Идёт отправка'
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
    target: 'catalog',
    catalogPath: '',
    productId: '',
    productName: '',
    url: ''
});

export const emptyRow = () => ({id: nextId(), buttons: [emptyButton()]});

export const utf8Length = (value) => new TextEncoder().encode(String(value || '')).length;

export const isVideo = (file) => Boolean(file?.type?.startsWith('video/'));

export const isAllowedMedia = (file) => MEDIA_TYPES.includes(String(file?.type || '').toLowerCase());

export const mediaError = (file) => {
    if (!file) return null;
    if (!isAllowedMedia(file)) return 'Подходят только JPG, PNG, GIF, WEBP или видео MP4, MOV, WEBM';
    if (file.size > FILE_LIMIT_BYTES) return 'Файл тяжелее 50 МБ — Telegram не примет';

    return null;
};

export const limitFor = (hasMedia, limits) => (hasMedia
    ? limits?.captionHtmlMaxChars ?? CAPTION_LIMIT
    : limits?.messageHtmlMaxChars ?? TEXT_LIMIT);

export const targetUrl = (button) => {
    if (button.target === 'catalog') {
        return button.catalogPath ? `${BOT_APP_URL}?startapp=catalog_${button.catalogPath}` : '';
    }

    if (button.target === 'product') {
        return button.productId ? `${BOT_APP_URL}?startapp=${button.productId}` : '';
    }

    return String(button.url || '').trim();
};

export const buttonProblem = (button) => {
    const text = String(button.text || '').trim();
    if (!text) return 'Без подписи кнопка не отправится';
    if (text.length > 256) return 'Подпись длиннее 256 знаков';

    if (button.target === 'catalog') return button.catalogPath ? null : 'Выберите каталог';
    if (button.target === 'product') return button.productId ? null : 'Выберите игру';

    const url = targetUrl(button);
    if (!url) return 'Укажите адрес';
    if (!/^(https?:\/\/|tg:\/\/)/i.test(url)) return 'Адрес должен начинаться с http://, https:// или tg://';
    if (url.length > 2048) return 'Адрес длиннее 2048 знаков';

    return null;
};

export const buttonToApi = (button) => {
    if (buttonProblem(button)) return null;

    return {text: String(button.text).trim(), url: targetUrl(button)};
};

export const buildKeyboard = (rows) => {
    const out = (rows || [])
        .map((row) => (row.buttons || []).map(buttonToApi).filter(Boolean))
        .filter((row) => row.length > 0);

    return out.length ? out : null;
};

export const countButtons = (rows) =>
    (rows || []).reduce((sum, row) => sum + (row.buttons || []).length, 0);

const isTouched = (button) => Boolean(
    String(button.text || '').trim() || button.catalogPath || button.productId || String(button.url || '').trim()
);

export const keyboardProblem = (rows, limits) => {
    const touched = (rows || []).flatMap((row) => (row.buttons || [])).filter(isTouched);

    for (const button of touched) {
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

export const testVerdict = (summary) => {
    const total = Number(summary?.total) || 0;
    const sent = Number(summary?.sent) || 0;
    const failed = Number(summary?.failed) || 0;

    if (total === 0) return {tone: 'danger', ok: false, title: 'Некому отправлять пробу: список админов пуст'};
    if (failed === 0) return {tone: 'positive', ok: true, title: `Проба дошла до всех админов: ${sent} из ${total}`};
    if (sent === 0) return {tone: 'danger', ok: false, title: `Проба не дошла ни до кого из ${total}`};

    return {tone: 'warning', ok: true, title: `Проба дошла до ${sent} из ${total}`};
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
