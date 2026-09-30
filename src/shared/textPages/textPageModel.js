export const SECTION_ROUTES = {
    page: '/info',
    guide: '/faq',
    news: '/news'
};

export const SECTION_TITLES = {
    guide: 'Инструкции',
    news: 'Новости'
};

export const TAG_TITLES = {
    ps: 'PlayStation',
    xbox: 'Xbox',
    general: 'Общее'
};

export const SECTION_TAGS = {
    guide: ['ps', 'xbox'],
    news: ['ps', 'xbox', 'general']
};

export const LEGACY_ROUTES = [
    {path: '/faq_playstation', to: '/faq?tag=ps'},
    {path: '/faq_xbox', to: '/faq?tag=xbox'},
    {path: '/privacy', to: '/info/privacy'},
    {path: '/pk', to: '/info/pk'},
    {path: '/cookie', to: '/info/cookie'},
    {path: '/about', to: '/info/about'},
    {path: '/contact', to: '/info/contact'},
    {path: '/reviews', to: '/info/reviews'}
];

export const textPageRoute = (page) => `${SECTION_ROUTES[page?.section] || SECTION_ROUTES.page}/${page?.slug || ''}`;

export const legacySlug = (value) => String(value || '').replace(/^[a-z0-9]{8,12}-/, '');

const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'long', year: 'numeric'});

export const dateTitle = (value) => {
    if (!value) return '';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : DATE_FORMAT.format(date).replace(' г.', '');
};

export const footerLinks = (pages) => (pages || [])
    .filter((page) => page.showInFooter)
    .map((page) => ({key: `page-${page.id}`, label: page.title, to: textPageRoute(page)}));

export const menuLinks = (pages) => (pages || [])
    .filter((page) => page.showInMenu)
    .map((page) => ({key: `page-${page.id}`, label: page.title, to: textPageRoute(page)}));
