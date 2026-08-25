import {createFilters} from '../../shared/lib/catalogQuery';

const CATEGORY_TILES = [
    {type: 'GAME', title: 'Игры', tone: 'games'},
    {type: 'SUBSCRIPTION', title: 'Подписки', tone: 'subscriptions'},
    {type: 'DONATION', title: 'Донат', tone: 'donation'},
    {type: 'ADD_ON', title: 'DLC и комплекты', tone: 'addons', extra: ['COMPLECT']}
];

const COUNT_HINTS = {
    SUBSCRIPTION: 'Варианты подписок',
    DONATION: 'Валюта в играх'
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
            note: COUNT_HINTS[tile.type] || `${tile.count.toLocaleString('ru-RU')} товаров`,
            filters: createFilters({type: tile.values})
        }));
};

export const buildCollections = () => [
    {id: 'sale', icon: '🔥', title: 'Скидки до 80%', filters: createFilters({onlyDiscount: true}), sorting: 'discount'},
    {id: 'preorder', icon: '📅', title: 'Предзаказы', filters: createFilters({preorder: true}), sorting: 'new'},
    {id: 'fresh', icon: '✨', title: 'Новинки месяца', filters: createFilters(), sorting: 'new'}
];

export const buildGenres = (facets, limit = 7) =>
    (facets?.genre || []).slice(0, limit).map((option) => ({
        value: option.value,
        label: option.label,
        filters: createFilters({genre: [option.value]})
    }));
