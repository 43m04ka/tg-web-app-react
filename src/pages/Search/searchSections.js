import {createFilters, productsPlural} from '../../shared/lib/catalogQuery';

const CATEGORY_TILES = [
    {type: 'GAME', title: 'Игры', tone: 'games', icon: 'games'},
    {type: 'SUBSCRIPTION', title: 'Подписки', tone: 'subscriptions', icon: 'subscriptions'},
    {type: 'DONATION', title: 'Донат', tone: 'donation', icon: 'donation'},
    {type: 'ADD_ON', title: 'DLC и комплекты', tone: 'addons', icon: 'addons', extra: ['COMPLECT']}
];

const optionsPlural = (count) => {
    const tail = count % 10;
    const hundred = count % 100;

    if (tail === 1 && hundred !== 11) return 'вариант';
    if (tail >= 2 && tail <= 4 && (hundred < 12 || hundred > 14)) return 'варианта';

    return 'вариантов';
};

const COUNT_HINTS = {
    SUBSCRIPTION: (count) => `${count.toLocaleString('ru-RU')} ${optionsPlural(count)}`,
    DONATION: () => 'Валюта в играх'
};

export const buildCategories = (facets) => {
    const options = facets?.type || [];
    const countOf = (value) => options.find((option) => option.value === value)?.count || 0;

    return CATEGORY_TILES
        .map((tile) => {
            const values = [tile.type, ...(tile.extra || [])].filter((value) => countOf(value) > 0);
            const count = values.reduce((sum, value) => sum + countOf(value), 0);

            return {...tile, values, count};
        })
        .filter((tile) => tile.values.length > 0)
        .map((tile) => ({
            ...tile,
            note: COUNT_HINTS[tile.type]
                ? COUNT_HINTS[tile.type](tile.count)
                : `${tile.count.toLocaleString('ru-RU')} ${productsPlural(tile.count)}`,
            filters: createFilters({type: tile.values})
        }));
};

export const buildGenres = (facets, limit = 7) =>
    (facets?.genre || []).slice(0, limit).map((option) => ({
        value: option.value,
        label: option.label,
        filters: createFilters({genre: [option.value]})
    }));
