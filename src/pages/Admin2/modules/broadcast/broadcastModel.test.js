import {
    buildKeyboard,
    buttonProblem,
    buttonToApi,
    emptyButton,
    keyboardProblem,
    limitFor,
    mediaError,
    readyToSend,
    recipientsTitle,
    scheduleProblem,
    utf8Length
} from './broadcastModel';

const button = (patch) => ({...emptyButton(), ...patch});

describe('limitFor', () => {
    it('переключается на подпись, когда есть медиа', () => {
        expect(limitFor(false, null)).toBe(4096);
        expect(limitFor(true, null)).toBe(1024);
    });

    it('слушает лимиты сервера', () => {
        expect(limitFor(false, {messageHtmlMaxChars: 3000})).toBe(3000);
        expect(limitFor(true, {captionHtmlMaxChars: 900})).toBe(900);
    });
});

describe('mediaError', () => {
    it('пропускает изображение и видео', () => {
        expect(mediaError({type: 'image/png', size: 10})).toBeNull();
        expect(mediaError({type: 'video/mp4', size: 10})).toBeNull();
    });

    it('отбивает прочие типы', () => {
        expect(mediaError({type: 'application/pdf', size: 10})).toBe('Только изображение или видео');
    });

    it('ловит файл тяжелее 50 МБ', () => {
        expect(mediaError({type: 'image/png', size: 60 * 1024 * 1024})).toMatch(/50 МБ/);
    });
});

describe('buttonToApi', () => {
    it('требует схему у ссылки', () => {
        expect(buttonToApi(button({text: 'A', url: 'example.com'}))).toBeNull();
        expect(buttonToApi(button({text: 'A', url: 'https://x.ru'}))).toEqual({text: 'A', url: 'https://x.ru'});
        expect(buttonToApi(button({text: 'A', url: 'tg://resolve'}))).toEqual({text: 'A', url: 'tg://resolve'});
    });

    it('открывает мини-приложение только по https', () => {
        expect(buttonToApi(button({text: 'A', actionType: 'web_app', webAppUrl: 'http://x.ru'}))).toBeNull();
        expect(buttonToApi(button({text: 'A', actionType: 'web_app', webAppUrl: 'https://x.ru'})))
            .toEqual({text: 'A', web_app: {url: 'https://x.ru'}});
    });

    it('меряет callback_data в байтах UTF-8, а не в знаках', () => {
        const cyrillic = 'а'.repeat(33);

        expect(utf8Length(cyrillic)).toBe(66);
        expect(buttonToApi(button({text: 'A', actionType: 'callback_data', callback_data: cyrillic}))).toBeNull();
        expect(buttonToApi(button({text: 'A', actionType: 'callback_data', callback_data: 'a'.repeat(64)}))).toBeTruthy();
    });

    it('не собирает кнопку без подписи', () => {
        expect(buttonToApi(button({text: '   ', url: 'https://x.ru'}))).toBeNull();
    });
});

describe('buildKeyboard', () => {
    it('выбрасывает пустые ряды', () => {
        const rows = [
            {id: '1', buttons: [button({text: 'A', url: 'https://x.ru'})]},
            {id: '2', buttons: [button({text: '', url: ''})]}
        ];

        expect(buildKeyboard(rows)).toHaveLength(1);
    });

    it('без кнопок отдаёт null, а не пустой массив', () => {
        expect(buildKeyboard([])).toBeNull();
        expect(buildKeyboard(null)).toBeNull();
    });
});

describe('buttonProblem', () => {
    it('называет причину', () => {
        expect(buttonProblem(button({text: 'A', url: 'ftp://x'}))).toMatch(/http/);
        expect(buttonProblem(button({text: ''}))).toMatch(/подписи/);
    });
});

describe('keyboardProblem', () => {
    it('ловит перебор по числу кнопок', () => {
        const rows = [{
            id: '1',
            buttons: Array.from({length: 5}, () => button({text: 'A', url: 'https://x.ru'}))
        }];

        expect(keyboardProblem(rows, {inlineKeyboard: {maxButtonsTotal: 3}})).toMatch(/больше/);
        expect(keyboardProblem(rows, {inlineKeyboard: {maxButtonsTotal: 10}})).toBeNull();
    });
});

describe('scheduleProblem', () => {
    it('не принимает прошедшее время', () => {
        expect(scheduleProblem(new Date(Date.now() - 5 * 60 * 1000).toISOString())).toMatch(/прошло/);
    });

    it('не пускает дальше тридцати дней', () => {
        expect(scheduleProblem(new Date(Date.now() + 40 * 24 * 3600 * 1000).toISOString())).toMatch(/30/);
    });

    it('принимает ближайшее будущее и пустое значение', () => {
        expect(scheduleProblem(new Date(Date.now() + 3600 * 1000).toISOString())).toBeNull();
        expect(scheduleProblem('')).toBeNull();
    });
});

describe('readyToSend', () => {
    const base = {limit: 4096, media: null, keyboardRows: [], schedule: ''};

    it('не выпускает пустое сообщение', () => {
        expect(readyToSend({...base, textLength: 0})).toMatch(/Пустое/);
    });

    it('разрешает одно медиа без текста', () => {
        expect(readyToSend({...base, textLength: 0, limit: 1024, media: {type: 'image/png', size: 100}}))
            .toBeNull();
    });

    it('ловит перебор длины', () => {
        expect(readyToSend({...base, textLength: 2000, limit: 1024, media: {type: 'image/png', size: 1}}))
            .toMatch(/длиннее/);
    });
});

describe('recipientsTitle', () => {
    it('склоняет получателей', () => {
        expect(recipientsTitle(1)).toMatch(/получатель$/);
        expect(recipientsTitle(3)).toMatch(/получателя$/);
        expect(recipientsTitle(11)).toMatch(/получателей$/);
        expect(recipientsTitle(21)).toMatch(/получатель$/);
        expect(recipientsTitle(112)).toMatch(/получателей$/);
    });
});
