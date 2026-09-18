import {
    defaultStorefrontId,
    pageIdOfType,
    resolveBotType,
    sectionList,
    storefrontList
} from './desktopNav';

const pages = [
    {id: 1, type: 'ps', name: 'PS Турция'},
    {id: 2, type: 'ps_india', name: 'PS Индия'},
    {id: 3, type: 'xbox', name: 'Xbox'},
    {id: 4, type: 'steam', name: 'Steam'},
    {id: 5, type: 'services', name: 'Сервисы'}
];

const startPages = [
    {id: 11, platform: 'tg', type: 'title', text: 'Витрины', structurePageId: null, serialNumber: 0},
    {id: 12, platform: 'tg', type: 'page', structurePageId: 3, serialNumber: 3, color: '#0f0'},
    {id: 13, platform: 'tg', type: 'page', structurePageId: 1, serialNumber: 1, color: '#00f'},
    {id: 14, platform: 'tg', type: 'page', structurePageId: 2, serialNumber: 2},
    {id: 15, platform: 'tg', type: 'page', structurePageId: 4, serialNumber: 4},
    {id: 16, platform: 'tg', type: 'page', structurePageId: 5, serialNumber: 5},
    {id: 17, platform: 'tg', type: 'link', url: 'https://t.me/x', structurePageId: null, serialNumber: 6},
    {id: 18, platform: 'web', type: 'page', structurePageId: 1, serialNumber: 1}
];

test('витрины идут по serialNumber и без standalone-страниц', () => {
    const list = storefrontList(startPages, pages, 'tg');

    expect(list.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(list[0].label).toBe('PS Турция');
    expect(list[0].color).toBe('#00f');
});

test('разделы собираются только из существующих standalone-страниц', () => {
    expect(sectionList(startPages, pages, 'tg')).toEqual([
        expect.objectContaining({key: 'steam', pageId: 4, route: '/steam', label: 'Пополнение'}),
        expect.objectContaining({key: 'services', pageId: 5, route: '/services', label: 'Коды'})
    ]);

    const withoutServices = startPages.filter((item) => item.structurePageId !== 5);
    expect(sectionList(withoutServices, pages, 'tg').map((item) => item.key)).toEqual(['steam']);
});

test('витрина по умолчанию — первая в списке', () => {
    expect(defaultStorefrontId(startPages, pages, 'tg')).toBe(1);
    expect(defaultStorefrontId([], pages, 'tg')).toBeNull();
});

test('для стенда без своих витрин берётся запасной бот', () => {
    expect(resolveBotType(startPages, 'test')).toBe('web');
    expect(resolveBotType(startPages, 'tg')).toBe('tg');
    expect(storefrontList(startPages, pages, 'test').map((item) => item.id)).toEqual([1]);
});

test('страница по типу', () => {
    expect(pageIdOfType(pages, 'steam')).toBe(4);
    expect(pageIdOfType(pages, 'nope')).toBeNull();
});
