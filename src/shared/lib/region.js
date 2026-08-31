const SHORT_TITLES = {
    ps: 'Турция',
    ps_india: 'Индия',
    xbox: 'Xbox',
    steam: 'Steam',
    services: 'Сервисы'
};

const FULL_TITLES = {
    ps: 'PS Турция',
    ps_india: 'PS Индия',
    xbox: 'Xbox',
    steam: 'Steam',
    services: 'Сервисы'
};

const ICON_FILES = {
    ps: 'ps.png',
    ps_india: 'ps-india.png',
    xbox: 'xbox.png',
    steam: 'steam.png',
    services: 'services.png'
};

const iconUrl = (file) => `${process.env.PUBLIC_URL || ''}/regions/${file}`;

export const WIDEST_REGION_TITLE = Object.values(SHORT_TITLES).reduce(
    (widest, title) => (title.length > widest.length ? title : widest),
    ''
);

export const regionTitle = (page, startPage) =>
    SHORT_TITLES[page?.type] || startPage?.title || page?.title || 'Витрина';

export const regionLabel = (page, startPage) =>
    FULL_TITLES[page?.type] || startPage?.title || page?.title || 'Витрина';

export const regionIcon = (page, startPage) => {
    const file = ICON_FILES[page?.type];
    if (file) return iconUrl(file);
    return startPage?.icon || page?.barIcon || null;
};
