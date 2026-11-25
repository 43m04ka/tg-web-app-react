import {buildHomePopular, buildHomeSubscriptions, currentHomeHero, homePreorder} from './homepageModel';
import {createProductOrigin} from '../../shared/lib/productOrigin';
import {routeStorefront} from './routeStorefront';
import {buildHero} from './storefrontModel';

const pages = [{id: 20, type: 'ps'}, {id: 35, type: 'ps_india'}, {id: 28, type: 'xbox'}];
const catalogs = [{id: 1, path: 'ps', structurePageId: 20}, {id: 2, path: 'india', structurePageId: 35}, {id: 3, path: 'xbox', structurePageId: 28}];
const originOf = createProductOrigin({pages, catalogs});
const game = (id, catalogId, name, extra = {}) => ({id, catalogId, name, type: 'GAME', price: 1000, onSale: true, ...extra});

test('популярное чередует регионы PS и Xbox, исключает карты, скрытое и снятое с продажи', () => {
    const products = [game(1, 3, 'Xbox Gift Card'), game(2, 3, 'Fable II'), game(3, 3, 'Fable III'),
        game(4, 1, 'Spider-Man'), game(5, 2, 'God of War'), game(6, 1, 'Hidden', {isHidden: true}),
        game(7, 2, 'Off', {onSale: false}), game(8, 3, 'Game Pass', {type: 'SUBSCRIPTION'})];
    const shelf = buildHomePopular({products, originOf});
    expect(shelf.offers.map((offer) => offer.product.name)).toEqual(['Spider-Man', 'God of War', 'Fable II', 'Fable III']);
});

test('одна игра в PS Турция и Индия не дублируется, варианты региона сохраняются', () => {
    const shelf = buildHomePopular({products: [game(1, 1, 'Elden Ring'), game(2, 2, 'Elden Ring', {price: 900})], originOf});
    expect(shelf.offers).toHaveLength(1);
    expect(shelf.offers[0].origins).toHaveLength(2);
    expect(shelf.offers[0].price).toBe(900);
});

test('назначенное популярное имеет приоритет над произвольными товарами каталога', () => {
    const shelf = buildHomePopular({products: [game(1, 3, 'Fable')], popularProducts: [{platform: 'web', product: game(2, 1, 'Elden Ring')}], botType: 'web', originOf});
    expect(shelf.offers.map((offer) => offer.product.name)).toEqual(['Elden Ring', 'Fable']);
});

test('подписки PS Plus и Game Pass идут после игр и сохраняют каталоги региона', () => {
    const products = [game(1, 3, 'Game Pass Ultimate 1 месяц', {type: 'SUBSCRIPTION'}),
        game(2, 1, 'PlayStation Plus Extra 3 месяца', {type: 'SUBSCRIPTION'}),
        game(3, 2, 'PS Plus Deluxe 12 месяцев', {type: 'SUBSCRIPTION'}),
        game(4, 1, 'EA Play 1 месяц', {type: 'SUBSCRIPTION'})];
    const shelves = buildHomeSubscriptions({products, catalogs, originOf});
    expect(shelves.map((shelf) => shelf.title)).toEqual(['PlayStation Plus', 'Xbox Game Pass']);
    expect(shelves.map((shelf) => shelf.pages.map((page) => page.pageId))).toEqual([[20, 35], [28]]);
});

test('отдельный GTA VI берёт существующий мобильный баннер без выдуманных цены и даты', () => {
    const product = game(1, 1, 'Grand Theft Auto VI');
    const item = homePreorder({banners: [{id: 7, pageId: 20, data: {title: 'GTA VI', device: 'mobile', productId: 1, image: '/gta.jpg'}}], products: [product], originOf});
    expect(item.id).toBe(7);
    expect(item.image).toBe('/gta.jpg');
    expect(item.product.id).toBe(1);
    expect(item.promoEndDate).toBeNull();
});

test('блок GTA VI отсутствует без соответствующего товара или баннера', () => {
    expect(homePreorder({banners: [], products: [game(1, 1, 'GTA V')], originOf})).toBeNull();
    expect(homePreorder({banners: [], products: [game(1, 1, 'GTA VI', {onSale: false})], originOf})).toBeNull();
});

test('из верхних баннеров убираются истёкшие акции и повтор GTA VI', () => {
    const hero = [{id: 1, title: 'GTA VI'}, {id: 2, title: 'Expired', promoEndDate: '2020-01-01'},
        {id: 3, title: 'Current', promoEndDate: '2027-01-01'}, {id: 4, title: 'News'}];
    expect(currentHomeHero(hero, Date.UTC(2026, 10, 2)).map((item) => item.id)).toEqual([3, 4]);
});

test.each(['/catalog/india', '/subscription/india', '/card/55'])(
    'витрина определяется по прямому адресу %s', (pathname) => {
        expect(routeStorefront({pathname, catalogs, products: [game(55, 2, 'Test')]})).toBe(35);
    }
);

test('неизвестная карточка не получает выдуманный регион', () => {
    expect(routeStorefront({pathname: '/card/999', catalogs, products: []})).toBeNull();
});

test('главная поддерживает общие новости и пользовательские баннеры основной страницы', () => {
    const banners = [{id: 1, type: 'custom', pageId: null, data: {title: 'Новости', image: '/news.jpg', url: '/news'}},
        {id: 2, type: 'custom', pageId: 99, data: {title: 'Акция', image: '/promo.jpg', url: '/news/promo'}}];
    expect(buildHero({banners, mainPageId: 99, pageIds: [20, 28]}).map((item) => item.id)).toEqual([1, 2]);
    expect(buildHero({banners, mainPageId: 99, pageIds: [20, 28], scopeId: 20})).toEqual([]);
});

test('Xbox banner keeps Xbox product and price', () => {
    const products = [game(1, 1, 'Grand Theft Auto VI', {price: 11320}), game(2, 3, 'Grand Theft Auto VI', {price: 9735})];
    const banners = [{id: 4, type: 'product', pageId: 20, data: {productId: 1, image: '/ps.jpg'}}, {id: 15, type: 'product', pageId: 28, data: {productId: 2, price: 9735, image: '/xbox.jpg'}}];
    const item = homePreorder({banners, products, originOf, pageId: 28});
    expect(item.product.id).toBe(2);
    expect(item.price).toBe(9735);
    expect(homePreorder({banners: [], products: [products[0]], originOf, pageId: 28})).toBeNull();
});
