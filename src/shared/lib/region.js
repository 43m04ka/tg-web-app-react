const SHORT_TITLES = {
    ps: 'Турция',
    ps_india: 'Индия',
    xbox: 'Xbox',
    steam: 'Steam',
    services: 'Сервисы'
};

export const WIDEST_REGION_TITLE = Object.values(SHORT_TITLES).reduce(
    (widest, title) => (title.length > widest.length ? title : widest),
    ''
);

export const regionTitle = (page, startPage) =>
    SHORT_TITLES[page?.type] || startPage?.title || page?.title || 'Витрина';

export const regionIcon = (page, startPage) => startPage?.icon || page?.barIcon || null;
