import {fullGameSpecs, gameCriteria, relatedPurchases} from './productDetails';

test('основные критерии берутся из данных товара без выдуманных значений', () => {
    const product = {platform: 'PS4, PS5', numberPlayers: '2', language: 'Русская озвучка', bubbles: ['25 GB', 'Поддерживается до 8 игроков в сети с PS Plus']};
    const rows = gameCriteria(product);
    expect(rows.map((item) => item.value)).toEqual(['2 · онлайн до 8', '25 ГБ', 'PlayStation 4, PlayStation 5', 'Русская озвучка']);
    expect(rows[3].russian).toBe(true);
    expect(gameCriteria({}).every((item) => item.value === null)).toBe(true);
});

test('характеристики сохраняют сетевые требования и возможности', () => {
    const rows = fullGameSpecs({platform: 'PS5', numberPlayers: '2', language: 'Русский текст', bubbles: ['PS Plus - обязательно для игры в сети', 'Вибрация DUALSHOCK 4'], starRating: {averageRating: 4.42, totalRatingsCount: 40288}});
    expect(rows.find((item) => item.label === 'Возможности игры').value).toBe('PS Plus - обязательно для игры в сети · Вибрация DUALSHOCK 4');
    expect(rows.find((item) => item.label === 'Рейтинг в магазине').value).toContain('40 288');
});

test('связанные покупки исключают чужие регионы, платформы, дубли и недоступные позиции', () => {
    const item = (id, extra = {}) => ({id, catalogId: 1, platform: 'PS4', price: 500, onSale: true, ...extra});
    const product = item(1, {conceptProducts: [item(1), item(2), item(3, {catalogId: 2}), item(4, {platform: 'PS5'})], conceptAddOns: [item(2), item(5, {isHidden: true}), item(6, {onSale: false}), item(7, {price: 0}), item(8)]});
    expect(relatedPurchases(product, (value) => ({pageId: value.catalogId})).map((value) => value.id)).toEqual([2, 8]);
    expect(relatedPurchases(null, () => null)).toEqual([]);
});
