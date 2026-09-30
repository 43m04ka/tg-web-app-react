import {
    blockSummary,
    insertAt,
    isDirty,
    moveItem,
    newBlock,
    prefixLines,
    publicRoute,
    toDraft,
    toPayload,
    validate,
    wrapSelection
} from './pagesModel';

const PAGE = {
    id: 3,
    title: 'Оплата и доставка',
    slug: 'payment',
    section: 'page',
    tag: '',
    excerpt: '',
    cover: '',
    isPublished: true,
    showInFooter: true,
    showInMenu: false,
    serialNumber: 2,
    publishedAt: null,
    blocks: [{type: 'heading', level: 2, text: 'Доставка'}, {type: 'text', text: 'Текст'}]
};

describe('черновик страницы', () => {
    it('возвращает те же данные после преобразования туда и обратно', () => {
        const payload = toPayload(toDraft(PAGE));

        expect(payload.blocks).toEqual(PAGE.blocks);
        expect(payload.slug).toBe('payment');
        expect(payload.showInFooter).toBe(true);
        expect(payload.serialNumber).toBe(2);
        expect(payload.publishedAt).toBeNull();
    });

    it('не считает изменением разные служебные идентификаторы блоков', () => {
        expect(isDirty(toDraft(PAGE), toDraft(PAGE))).toBe(false);
    });

    it('замечает правку текста блока', () => {
        const draft = toDraft(PAGE);
        draft.blocks[1].text = 'Новый текст';

        expect(isDirty(draft, toDraft(PAGE))).toBe(true);
    });

    it('сбрасывает метку у обычной страницы', () => {
        expect(toPayload({...toDraft(PAGE), tag: 'ps'}).tag).toBe('');
        expect(toPayload({...toDraft(PAGE), section: 'news', tag: 'ps'}).tag).toBe('ps');
    });

    it('новая страница создаётся в выбранном разделе', () => {
        expect(toDraft(null, 'news').section).toBe('news');
    });
});

describe('проверка формы', () => {
    it('требует заголовок и латинский адрес', () => {
        expect(validate({...toDraft(PAGE), title: ' '}).title).toBeTruthy();
        expect(validate({...toDraft(PAGE), slug: 'оплата'}).slug).toBeTruthy();
        expect(validate({...toDraft(PAGE), slug: ''})).toEqual({});
        expect(validate(toDraft(PAGE))).toEqual({});
    });
});

describe('блоки', () => {
    it('создаёт пустой блок нужного вида', () => {
        const block = newBlock('faq');

        expect(block.type).toBe('faq');
        expect(block.items).toEqual([{question: '', answer: ''}]);
        expect(block.uid).toBeTruthy();
    });

    it('двигает и вставляет блоки', () => {
        expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
        expect(moveItem(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
        expect(insertAt(['a', 'c'], 1, 'b')).toEqual(['a', 'b', 'c']);
    });

    it('кратко описывает блок', () => {
        expect(blockSummary({type: 'text', text: 'Раз\nдва'})).toBe('Раз два');
        expect(blockSummary({type: 'gallery', images: ['a', 'b']})).toBe('Картинок: 2');
        expect(blockSummary({type: 'buttons', items: [{label: 'Ozon'}, {label: 'Авито'}]})).toBe('Ozon, Авито');
    });
});

describe('разметка текста', () => {
    it('оборачивает выделение', () => {
        expect(wrapSelection('Нажмите PS сейчас', 8, 10, '**', '**', 'текст')).toEqual({
            value: 'Нажмите **PS** сейчас',
            start: 10,
            end: 12
        });
    });

    it('подставляет заготовку, если ничего не выделено', () => {
        expect(wrapSelection('ab', 1, 1, '[', '](https://)', 'ссылка').value).toBe('a[ссылка](https://)b');
    });

    it('превращает выделенные строки в список', () => {
        expect(prefixLines('раз\nдва\nтри', 1, 6, '- ').value).toBe('- раз\n- два\nтри');
        expect(prefixLines('раз\nдва', 0, 7, (index) => `${index + 1}. `).value).toBe('1. раз\n2. два');
    });
});

describe('адрес на сайте', () => {
    it('зависит от раздела', () => {
        expect(publicRoute({section: 'page', slug: 'pk'})).toBe('/info/pk');
        expect(publicRoute({section: 'guide', slug: 'a'})).toBe('/faq/a');
        expect(publicRoute({section: 'news', slug: 'b'})).toBe('/news/b');
    });
});
