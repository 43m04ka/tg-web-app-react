import {filterStorefrontStructure, allStorefrontsClosed, hiddenStorefront, filterServiceCatalog} from './storefrontMaintenance';

const source = {
    pages: [{id: 20, type: 'ps'}, {id: 35, type: 'ps_india'}, {id: 28, type: 'xbox'}, {id: 40, type: 'services'}],
    catalogs: [{id: 1, structurePageId: 20}, {id: 2, path: 'india_games', structurePageId: 35}],
    startPages: [{structurePageId: 20}, {structurePageId: 35}],
    popularProducts: [{product: {id: 200, catalogId: 2}}, {product: {id: 100, catalogId: 1}}],
    mainPageProducts: [{id: 200, catalogId: 2}],
    banners: [{data: {catalogId: 2}}, {data: {url: '/?store=35'}}, {data: {url: '/catalog/2'}}, {data: {url: '/catalog/india_games'}}, {data: {url: '/services'}}]
};

test('Индия скрывается целиком, другие витрины остаются', () => {
    const next = filterStorefrontStructure(source, {ps_india: {enabled: true}});
    expect(next.pages.map((p) => p.id)).toEqual([20, 28, 40]);
    expect(next.startPages).toHaveLength(1);
    expect(next.popularProducts).toHaveLength(1);
    expect(next.mainPageProducts).toHaveLength(0);
    expect(next.banners).toEqual([{data: {url: '/services'}}]);
    expect(source.pages).toHaveLength(4);
    expect(filterStorefrontStructure(source, {}).pages).toHaveLength(4);
});

test('сервисы скрывают своё меню и баннеры', () => {
    const next = filterStorefrontStructure(source, {services: {enabled: true}});
    expect(next.pages.some((p) => p.type === 'services')).toBe(false);
    expect(next.banners.some((b) => b.data.url === '/services')).toBe(false);
});

test('экран всего магазина включается только когда не осталось открытых витрин', () => {
    expect(allStorefrontsClosed(source.pages, {ps_india: {}})).toBe(false);
    expect(allStorefrontsClosed(source.pages, {ps: {}, ps_india: {}, xbox: {}, services: {}})).toBe(true);
    expect(hiddenStorefront({id: 'ps_india'})).toBe(true);
    expect(hiddenStorefront({id: 'ps_india', platforms: ['web']})).toBe(false);
});

test('связанные индийские подписки удаляются из сервисов, обычные услуги остаются', () => {
    const brands = [{offers: [{catalogId: 2}, {catalogId: 1}, {id: 'code'}], catalogLinks: [{catalogId: 2}, {catalogId: 1}]}, {offers: [{catalogId: 2}]}];
    const result = filterServiceCatalog(brands, [{id: 1}]);
    expect(result).toHaveLength(1);
    expect(result[0].offers).toEqual([{catalogId: 1}, {id: 'code'}]);
    expect(result[0].catalogLinks).toEqual([{catalogId: 1}]);
    expect(brands[0].offers).toHaveLength(3);
});
