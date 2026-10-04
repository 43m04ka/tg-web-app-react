import {catalogSummary, filterCatalog, gameCatalog, isIncluded, sectionOfBenefit, thumb, tierInfoOf} from './contentsModel';

const info = {
    tiers: [{key: 'essential', name: 'PS Plus Essential'}, {key: 'extra', name: 'PS Plus Extra'}, {key: 'deluxe', name: 'PS Plus Deluxe'}],
    sections: [
        {key: 'monthly', title: 'Игры месяца', tier: 'essential', games: [{productId: 'M', name: 'Monthly', availableUntil: '2026-10-06T08:00:00.000Z'}]},
        {key: 'catalog', title: 'Каталог игр', tier: 'extra', games: [{productId: 'C', name: 'Catalog'}, {productId: 'M', name: 'Monthly'}]},
        {key: 'classics', title: 'Классика', tier: 'deluxe', games: [{productId: 'K', name: 'Classic'}]}
    ]
};

test('уровень сайта сопоставляется с уровнем Sony', () => {
    expect(tierInfoOf(info, 'Extra').key).toBe('extra');
    expect(tierInfoOf(info, 'Premium').key).toBe('deluxe');
    expect(tierInfoOf({tiers: [{key: 'eaplay', name: 'EA Play'}]}, 'EA Play 12 месяцев').key).toBe('eaplay');
});

test('игра из нескольких разделов считается один раз по младшему уровню', () => {
    const entries = gameCatalog(info);
    const monthly = entries.find((entry) => entry.game.productId === 'M');

    expect(entries).toHaveLength(3);
    expect(monthly.minTier).toBe('essential');
    expect(monthly.sections.map((item) => item.key)).toEqual(['monthly', 'catalog']);
    expect(monthly.game.availableUntil).toBe('2026-10-06T08:00:00.000Z');
    expect(entries.find((entry) => entry.game.productId === 'K').minTierName).toBe('Deluxe');
});

test('для уровня видно, что входит и что нет', () => {
    const entries = gameCatalog(info);

    expect(catalogSummary(entries, 'extra')).toEqual({total: 3, included: 2, excluded: 1});
    expect(filterCatalog(entries, {tierKey: 'extra', status: 'out'}).map((entry) => entry.game.name)).toEqual(['Classic']);
    expect(filterCatalog(entries, {tierKey: 'essential', status: 'in'}).map((entry) => entry.game.name)).toEqual(['Monthly']);
    expect(filterCatalog(entries, {tierKey: 'deluxe', section: 'catalog', query: 'cat'}).map((entry) => entry.game.name)).toEqual(['Catalog']);
    expect(isIncluded({minTier: 'eaplay'}, 'eaplay')).toBe(true);
});

test('пункт состава ведёт в свой раздел, если он не пустой', () => {
    expect(sectionOfBenefit(info, 'Каталог классики')).toBe('classics');
    expect(sectionOfBenefit(info, 'Пробные версии игр')).toBeNull();
    expect(sectionOfBenefit(info, 'Сетевая игра')).toBeNull();
});

test('обложки Sony запрашиваются уменьшенными', () => {
    expect(thumb('https://image.api.playstation.com/vulcan/a.png')).toBe('https://image.api.playstation.com/vulcan/a.png?w=240&thumb=false');
    expect(thumb('https://example.com/a.png')).toBe('https://example.com/a.png');
});
