import {embedUrl, parseInline, parseText, plainText, safeLink} from './richText';

describe('parseInline', () => {
    it('разбирает жирный текст и ссылки', () => {
        expect(parseInline('Нажмите **PS** и [войдите](https://example.com/a).')).toEqual([
            {type: 'text', value: 'Нажмите '},
            {type: 'bold', children: [{type: 'text', value: 'PS'}]},
            {type: 'text', value: ' и '},
            {type: 'link', href: 'https://example.com/a', value: 'войдите'},
            {type: 'text', value: '.'}
        ]);
    });

    it('превращает голый адрес в ссылку и не захватывает точку в конце', () => {
        expect(parseInline('Сайт https://gwstore.ru.')).toEqual([
            {type: 'text', value: 'Сайт '},
            {type: 'link', href: 'https://gwstore.ru', value: 'https://gwstore.ru'},
            {type: 'text', value: '.'}
        ]);
    });

    it('не делает ссылку из небезопасного адреса', () => {
        expect(parseInline('[жми](javascript:alert(1))')[0].type).toBe('text');
        expect(safeLink('javascript:alert(1)')).toBe('');
        expect(safeLink('/faq')).toBe('/faq');
    });
});

describe('parseText', () => {
    it('делит текст на абзацы и списки', () => {
        const parts = parseText('Первый\nвторая строка\n\n- раз\n- два\n\n3. три\n4. четыре\nпосле списка');

        expect(parts.map((part) => part.kind)).toEqual(['p', 'ul', 'ol', 'p']);
        expect(parts[0].lines).toEqual(['Первый', 'вторая строка']);
        expect(parts[1].items.map((item) => item.text)).toEqual(['раз', 'два']);
        expect(parts[2].items.map((item) => item.number)).toEqual([3, 4]);
        expect(parts[3].lines).toEqual(['после списка']);
    });

    it('не считает пункт вида 1.1. элементом списка', () => {
        expect(parseText('1.1. Оператор ставит целью')[0].kind).toBe('p');
    });

    it('не склеивает списки из разных абзацев', () => {
        expect(parseText('- раз\n\n- два').length).toBe(2);
    });
});

describe('plainText и embedUrl', () => {
    it('убирает разметку', () => {
        expect(plainText('**Важно:** [тут](https://a.b)\nстрока')).toBe('Важно: тут строка');
    });

    it('строит адрес встраивания видео', () => {
        expect(embedUrl('https://www.youtube.com/watch?v=vo8fP-RrCV0')).toBe('https://www.youtube.com/embed/vo8fP-RrCV0');
        expect(embedUrl('https://youtu.be/vo8fP-RrCV0')).toBe('https://www.youtube.com/embed/vo8fP-RrCV0');
        expect(embedUrl('https://example.com/page')).toBe('');
    });
});
