import {createProductOrigin} from './productOrigin';

const catalogs = [
    {id: 100, path: 'games', structurePageId: 1},
    {id: 200, path: 'india', structurePageId: 2},
    {id: 300, path: 'orphan', structurePageId: 99}
];

const pages = [
    {id: 1, type: 'ps', name: 'PS Турция'},
    {id: 2, type: 'ps_india', name: 'PS Индия'}
];

const startPages = [
    {structurePageId: 1, title: 'Турция', color: '#123'},
    {structurePageId: 2, title: 'Индия', color: ''}
];

const originOf = createProductOrigin({catalogs, pages, startPages});

test('витрина товара берётся из каталога', () => {
    expect(originOf({catalogId: 100})).toEqual({
        pageId: 1,
        type: 'ps',
        label: 'PS Турция',
        title: 'Турция',
        icon: '/regions/ps.png',
        color: '#123'
    });
});

test('вторая витрина отличается от первой', () => {
    expect(originOf({catalogId: 200})).toEqual(expect.objectContaining({pageId: 2, label: 'PS Индия'}));
});

test('товар без известного каталога или страницы остаётся без витрины', () => {
    expect(originOf({catalogId: 999})).toBeNull();
    expect(originOf({catalogId: 300})).toBeNull();
    expect(originOf(null)).toBeNull();
});
