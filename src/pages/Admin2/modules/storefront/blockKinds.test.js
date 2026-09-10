import {
    blockProblem,
    describeBlock,
    describeTarget,
    detectKind,
    detectLink,
    moveBlock,
    renumber,
    sortBlocks,
    toBlockPayload,
    toFormValues
} from './blockKinds';

describe('detectKind', () => {
    it('узнаёт вид по типу из базы', () => {
        expect(detectKind({type: 'banner-clickable'}, 'body').key).toBe('banner-link');
        expect(detectKind({type: 'discount'}, 'body').key).toBe('discount');
        expect(detectKind({type: 'slider-non-clickable'}, 'head').key).toBe('static');
    });

    it('падает на обычный каталог для незнакомого типа', () => {
        expect(detectKind({type: 'невесть что'}, 'body').key).toBe('ordinary');
    });
});

describe('detectLink', () => {
    it('разбирает по самому длинному префиксу', () => {
        expect(detectLink('/choice-catalog/ps')).toEqual({target: 'choice', value: 'ps'});
        expect(detectLink('/catalog/ps')).toEqual({target: 'catalog', value: 'ps'});
        expect(detectLink('/card/42')).toEqual({target: 'card', value: '42'});
    });

    it('всё остальное считает внешней ссылкой', () => {
        expect(detectLink('https://x.ru')).toEqual({target: 'external', value: 'https://x.ru'});
        expect(detectLink(null)).toEqual({target: 'external', value: ''});
    });
});

describe('toBlockPayload', () => {
    it('обнуляет поля, которых у нового вида нет', () => {
        const values = {
            ...toFormValues({type: 'banner-clickable', url: 'u', path: '/card/1'}, 'body'),
            kind: 'ordinary',
            name: 'Полка',
            path: 'ps_games'
        };

        const payload = toBlockPayload(values, {group: 'body', structurePageId: 3});

        expect(payload.url).toBeNull();
        expect(payload.path).toBe('ps_games');
        expect(payload.structurePageId).toBe(3);
    });

    it('собирает path кликабельного блока из префикса', () => {
        const payload = toBlockPayload(
            {kind: 'banner-link', linkTarget: 'card', linkValue: '42', url: 'pic', serialNumber: 1},
            {group: 'body'}
        );

        expect(payload.path).toBe('/card/42');
        expect(payload.type).toBe('banner-clickable');
    });

    it('внешнюю ссылку кладёт без префикса', () => {
        const payload = toBlockPayload(
            {kind: 'banner-link', linkTarget: 'external', linkValue: 'https://x.ru', url: 'pic'},
            {group: 'body'}
        );

        expect(payload.path).toBe('https://x.ru');
    });

    it('переживает обход туда и обратно', () => {
        const stored = {
            type: 'discount',
            group: 'body',
            name: 'Скидки',
            path: 'sale',
            serialNumber: 2,
            backgroundColor: '#111',
            imageIcon: 'ic',
            deleteDate: 1700000000000,
            isRoundedBorderTop: 1,
            isRoundedBorderBottom: 0
        };

        const back = toBlockPayload(toFormValues(stored, 'body'), {group: 'body'});

        expect(back).toMatchObject({
            type: 'discount',
            name: 'Скидки',
            path: 'sale',
            deleteDate: 1700000000000,
            isRoundedBorderTop: 1,
            isRoundedBorderBottom: 0
        });
    });
});

describe('blockProblem', () => {
    it('требует обязательные поля вида', () => {
        expect(blockProblem({kind: 'ordinary', name: '', path: 'x'}, 'body')).toMatch(/названия/);
        expect(blockProblem({kind: 'ordinary', name: 'A', path: ''}, 'body')).toMatch(/путь/i);
        expect(blockProblem({kind: 'banner-static', url: ''}, 'body')).toMatch(/картинка/i);
    });

    it('пускает только цифры в ID карточки', () => {
        expect(blockProblem({kind: 'banner-link', url: 'p', linkTarget: 'card', linkValue: 'abc'}, 'body'))
            .toMatch(/цифры/);
        expect(blockProblem({kind: 'banner-link', url: 'p', linkTarget: 'card', linkValue: '42'}, 'body'))
            .toBeNull();
    });

    it('требует схему у внешнего адреса', () => {
        expect(blockProblem({kind: 'banner-link', url: 'p', linkTarget: 'external', linkValue: 'x.ru'}, 'body'))
            .toMatch(/http/);
    });
});

describe('порядок блоков', () => {
    it('перестановка меняет номера двух соседей', () => {
        const list = [{id: 1, serialNumber: 0}, {id: 2, serialNumber: 1}, {id: 3, serialNumber: 2}];
        const moved = moveBlock(list, 3, -1);

        expect(moved.map((item) => item.id)).toEqual([1, 3, 2]);
        expect(moved.map((item) => item.serialNumber)).toEqual([0, 1, 2]);
    });

    it('за край не переставляет', () => {
        const list = [{id: 1, serialNumber: 0}, {id: 2, serialNumber: 1}];

        expect(moveBlock(list, 1, -1)).toBeNull();
        expect(moveBlock(list, 2, 1)).toBeNull();
        expect(moveBlock(list, 99, 1)).toBeNull();
    });

    it('дыры в нумерации не ломают порядок', () => {
        const list = [{id: 1, serialNumber: 5}, {id: 2, serialNumber: 0}, {id: 3, serialNumber: 3}];

        expect(sortBlocks(list).map((item) => item.id)).toEqual([2, 3, 1]);
        expect(renumber(list).map((item) => item.serialNumber)).toEqual([0, 1, 2]);
    });
});

describe('подписи', () => {
    it('описывает блок и его цель', () => {
        expect(describeBlock({type: 'ordinary'}, 'body')).toBe('Каталог');
        expect(describeBlock({type: 'banner-clickable', path: '/card/1'}, 'body')).toMatch(/Карточка товара/);
        expect(describeTarget({type: 'banner-clickable', path: '/card/1'}, 'body')).toMatch(/1$/);
        expect(describeTarget({type: 'banner-non-clickable'}, 'body')).toBe('—');
    });
});
