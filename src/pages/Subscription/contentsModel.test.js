import {sectionsFor, thumb, tierInfoOf} from './contentsModel';

const info = {
    tiers: [{key: 'essential', name: 'PS Plus Essential'}, {key: 'extra', name: 'PS Plus Extra'}, {key: 'deluxe', name: 'PS Plus Deluxe'}],
    sections: [
        {key: 'monthly', tier: 'essential', games: [{name: 'a'}]},
        {key: 'catalog', tier: 'extra', games: [{name: 'b'}]},
        {key: 'classics', tier: 'deluxe', games: [{name: 'c'}]},
        {key: 'empty', tier: 'extra', games: []}
    ]
};

test('уровень сайта сопоставляется с уровнем Sony', () => {
    expect(tierInfoOf(info, 'Extra').key).toBe('extra');
    expect(tierInfoOf(info, 'Premium').key).toBe('deluxe');
    expect(tierInfoOf({tiers: [{key: 'eaplay', name: 'EA Play'}]}, 'EA Play 12 месяцев').key).toBe('eaplay');
});

test('уровень видит только свои и младшие разделы', () => {
    expect(sectionsFor(info, 'essential').map((item) => item.key)).toEqual(['monthly']);
    expect(sectionsFor(info, 'extra').map((item) => item.key)).toEqual(['monthly', 'catalog']);
    expect(sectionsFor(info, 'deluxe').map((item) => item.key)).toEqual(['monthly', 'catalog', 'classics']);
});

test('обложки Sony запрашиваются уменьшенными', () => {
    expect(thumb('https://image.api.playstation.com/vulcan/a.png')).toBe('https://image.api.playstation.com/vulcan/a.png?w=240&thumb=false');
    expect(thumb('https://example.com/a.png')).toBe('https://example.com/a.png');
});
