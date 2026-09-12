import {
    BOT_APP_URL,
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
    testVerdict,
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
    it('пропускает то, что примет Telegram', () => {
        expect(mediaError({type: 'image/png', size: 10})).toBeNull();
        expect(mediaError({type: 'image/webp', size: 10})).toBeNull();
        expect(mediaError({type: 'video/mp4', size: 10})).toBeNull();
    });

    it('отбивает прочие типы, в том числе редкие картинки', () => {
        expect(mediaError({type: 'application/pdf', size: 10})).toMatch(/JPG/);
        expect(mediaError({type: 'image/heic', size: 10})).toMatch(/JPG/);
    });

    it('ловит файл тяжелее 50 МБ', () => {
        expect(mediaError({type: 'image/png', size: 60 * 1024 * 1024})).toMatch(/50 МБ/);
    });
});

describe('buttonToApi', () => {
    it('ведёт в каталог мини-приложения', () => {
        expect(buttonToApi(button({text: 'Игры', target: 'catalog', catalogPath: 'ps_tur_games'})))
            .toEqual({text: 'Игры', url: `${BOT_APP_URL}?startapp=catalog_ps_tur_games`});
    });

    it('ведёт в карточку игры', () => {
        expect(buttonToApi(button({text: 'Купить', target: 'product', productId: 42})))
            .toEqual({text: 'Купить', url: `${BOT_APP_URL}?startapp=42`});
    });

    it('требует схему у своей ссылки', () => {
        expect(buttonToApi(button({text: 'A', target: 'url', url: 'example.com'}))).toBeNull();
        expect(buttonToApi(button({text: 'A', target: 'url', url: 'https://x.ru'}))).toEqual({text: 'A', url: 'https://x.ru'});
        expect(buttonToApi(button({text: 'A', target: 'url', url: 'tg://resolve'}))).toEqual({text: 'A', url: 'tg://resolve'});
    });

    it('не собирает кнопку без подписи или без цели', () => {
        expect(buttonToApi(button({text: '   ', target: 'catalog', catalogPath: 'x'}))).toBeNull();
        expect(buttonToApi(button({text: 'A', target: 'catalog'}))).toBeNull();
        expect(buttonToApi(button({text: 'A', target: 'product'}))).toBeNull();
    });
});

describe('utf8Length', () => {
    it('считает байты, а не знаки', () => {
        expect(utf8Length('а'.repeat(33))).toBe(66);
    });
});

describe('buildKeyboard', () => {
    it('выбрасывает пустые ряды', () => {
        const rows = [
            {id: '1', buttons: [button({text: 'A', target: 'url', url: 'https://x.ru'})]},
            {id: '2', buttons: [button({text: ''})]}
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
        expect(buttonProblem(button({text: 'A', target: 'url', url: 'ftp://x'}))).toMatch(/http/);
        expect(buttonProblem(button({text: ''}))).toMatch(/подписи/);
        expect(buttonProblem(button({text: 'A', target: 'catalog'}))).toMatch(/каталог/);
        expect(buttonProblem(button({text: 'A', target: 'product'}))).toMatch(/игру/);
    });
});

describe('keyboardProblem', () => {
    it('ловит перебор по числу кнопок', () => {
        const rows = Array.from({length: 5}, (item, index) => ({
            id: String(index),
            buttons: [button({text: 'A', target: 'url', url: 'https://x.ru'})]
        }));

        expect(keyboardProblem(rows, {inlineKeyboard: {maxButtonsTotal: 3}})).toMatch(/больше/);
        expect(keyboardProblem(rows, {inlineKeyboard: {maxButtonsTotal: 10}})).toBeNull();
    });

    it('не придирается к нетронутой кнопке', () => {
        expect(keyboardProblem([{id: '1', buttons: [button({})]}], null)).toBeNull();
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

describe('testVerdict', () => {
    it('различает полный успех, частичный и провал', () => {
        expect(testVerdict({total: 2, sent: 2, failed: 0})).toMatchObject({ok: true, tone: 'positive'});
        expect(testVerdict({total: 2, sent: 1, failed: 1})).toMatchObject({ok: true, tone: 'warning'});
        expect(testVerdict({total: 2, sent: 0, failed: 2})).toMatchObject({ok: false, tone: 'danger'});
        expect(testVerdict({total: 0, sent: 0, failed: 0})).toMatchObject({ok: false});
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
