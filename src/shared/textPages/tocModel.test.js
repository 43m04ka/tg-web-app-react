import {hasToc, introLength, sectionNumber, sectionsCount, sectionsTitle, tocEntries} from './tocModel';

const heading = (text, level = 3) => ({type: 'heading', level, text});
const text = (value) => ({type: 'text', text: value});

describe('tocEntries', () => {
    it('нумерует заголовки по порядку, если номеров в тексте нет', () => {
        const entries = tocEntries([text('Вступление'), heading('Оплата'), text('…'), heading('Доставка')]);

        expect(entries.map((entry) => [entry.id, entry.number, entry.title])).toEqual([
            ['section-1', 1, 'Оплата'],
            ['section-3', 2, 'Доставка']
        ]);
    });

    it('берёт номер из текста заголовка и убирает его из подписи', () => {
        const entries = tocEntries([heading('1. Общие положения'), heading('2) Понятия'), heading('Примечание')]);

        expect(entries.map((entry) => [entry.number, entry.title, entry.nested])).toEqual([
            [1, 'Общие положения', false],
            [2, 'Понятия', false],
            [null, 'Примечание', true]
        ]);
    });

    it('ненумерованные заголовки до первого номера остаются во вступлении', () => {
        const blocks = [heading('Политика в отношении данных'), heading('1. Общие положения'), text('…'), heading('2. Понятия')];
        const entries = tocEntries(blocks);

        expect(entries.map((entry) => entry.blockIndex)).toEqual([1, 3]);
        expect(introLength(blocks, entries)).toBe(1);
    });

    it('вкладывает подзаголовки и не даёт им номер', () => {
        const entries = tocEntries([heading('Отзывы', 2), heading('Telegram', 3), heading('Авито', 2)]);

        expect(entries.map((entry) => [entry.number, entry.nested])).toEqual([[1, false], [null, true], [2, false]]);
    });

    it('считает разделы без вложенных', () => {
        expect(sectionsCount(tocEntries([heading('A', 2), heading('a', 3), heading('B', 2)]))).toBe(2);
    });

    it('пропускает пустые заголовки', () => {
        expect(tocEntries([heading('  '), heading('A')])).toHaveLength(1);
        expect(tocEntries(null)).toEqual([]);
    });
});

describe('hasToc и introLength', () => {
    it('оглавление появляется от двух заголовков', () => {
        expect(hasToc([heading('A')])).toBe(false);
        expect(hasToc([heading('A'), heading('B')])).toBe(true);
    });

    it('вступление — всё до первого заголовка', () => {
        const blocks = [text('a'), text('b'), heading('A'), heading('B')];

        expect(introLength(blocks, tocEntries(blocks))).toBe(2);
        expect(introLength([text('a')], [])).toBe(1);
    });
});

describe('подписи', () => {
    it('номер раздела из двух цифр', () => {
        expect(sectionNumber(3)).toBe('03');
        expect(sectionNumber(12)).toBe('12');
        expect(sectionNumber(null)).toBe('');
    });

    it('склоняет «раздел»', () => {
        expect(sectionsTitle(1)).toBe('1 раздел');
        expect(sectionsTitle(3)).toBe('3 раздела');
        expect(sectionsTitle(13)).toBe('13 разделов');
        expect(sectionsTitle(21)).toBe('21 раздел');
    });
});
