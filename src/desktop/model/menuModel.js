import {catalogRoute, subscriptionRoute} from '../../shared/lib/pageRoutes';

const SUBSCRIPTIONS = [
    {suffix: 'psplus', label: 'PS Plus'},
    {suffix: 'eaplay', label: 'EA Play'},
    {suffix: 'gamepass', label: 'Game Pass'}
];

const REGION_TITLES = {
    ps: 'Турция',
    ps_india: 'Индия'
};

const PS_TYPES = ['ps', 'ps_india'];

const isSubscriptionPath = (path) => SUBSCRIPTIONS.some(({suffix}) => String(path || '').endsWith(`_${suffix}`));

const subscriptionsOf = (catalogs, shop) => SUBSCRIPTIONS
    .map(({suffix, label}) => {
        const catalog = (catalogs || []).find((item) =>
            item.structurePageId === shop.id && String(item.path || '').endsWith(`_${suffix}`));

        return catalog
            ? {key: `${shop.id}-${suffix}`, suffix, label, action: 'scoped', shop, to: subscriptionRoute(catalog.path)}
            : null;
    })
    .filter(Boolean);

const collectionsOf = (blocks, shop) => (blocks || [])
    .filter((block) => block.structurePageId === shop.id
        && String(block.type || '').startsWith('ordinary')
        && block.path
        && String(block.name || '').trim()
        && !isSubscriptionPath(block.path))
    .sort((left, right) => (left.serialNumber ?? 0) - (right.serialNumber ?? 0))
    .map((block) => ({
        key: `${shop.id}-block-${block.id}`,
        label: String(block.name).trim(),
        action: 'scoped',
        shop,
        to: catalogRoute(block.path)
    }));

const allGames = (shop) => ({key: `${shop.id}-all`, label: 'Все игры', action: 'storefront', shop});

export const menuGroups = ({storefronts, sections, catalogs, blocks, pageLinks}) => {
    const psShops = (storefronts || []).filter((shop) => PS_TYPES.includes(shop.type));
    const xbox = (storefronts || []).find((shop) => shop.type === 'xbox') || null;
    const sectionOf = (key) => (sections || []).find((section) => section.key === key) || null;

    const psPlus = psShops
        .map((shop) => ({shop, links: subscriptionsOf(catalogs, shop).filter((link) => link.suffix !== 'gamepass')}))
        .filter((column) => column.links.length);

    const gamePass = xbox ? subscriptionsOf(catalogs, xbox).find((link) => link.suffix === 'gamepass') : null;
    const steam = sectionOf('steam');
    const services = sectionOf('services');

    const shop = [
        psShops.length ? {
            ...allGames(psShops[0]),
            key: 'ps-games',
            icon: 'gamepad',
            label: 'Игры для PlayStation',
            columns: psShops.map((item) => ({
                key: item.id,
                title: REGION_TITLES[item.type] || item.label,
                links: [allGames(item), ...collectionsOf(blocks, item)]
            }))
        } : null,
        psPlus.length ? {
            ...psPlus[0].links[0],
            key: 'ps-plus',
            icon: 'plus',
            label: 'Подписка PlayStation Plus',
            columns: psPlus.map((column) => ({
                key: column.shop.id,
                title: REGION_TITLES[column.shop.type] || column.shop.label,
                links: column.links
            }))
        } : null,
        xbox ? {
            ...allGames(xbox),
            key: 'xbox-games',
            icon: 'xbox',
            label: 'Игры для Xbox',
            columns: [{key: xbox.id, title: 'Xbox', links: [allGames(xbox), ...collectionsOf(blocks, xbox)]}]
        } : null,
        gamePass ? {...gamePass, key: 'game-pass', icon: 'ticket', label: 'Подписка Game Pass', note: 'Game Pass Ultimate для Xbox'} : null,
        steam ? {key: 'steam', icon: 'wallet', label: 'Пополнение Steam', note: 'Пополнение баланса Steam', action: 'section', section: steam} : null,
        services ? {key: 'services', icon: 'card', label: 'Оплата сервисов', note: 'Оплата зарубежных сервисов и подписок', action: 'section', section: services} : null
    ].filter(Boolean);

    const buyers = [
        {key: 'activate', icon: 'box', label: 'Получить заказ с маркетплейса', note: 'Активация заказа, оформленного на маркетплейсе', action: 'route', to: '/activate'},
        {
            key: 'guides',
            icon: 'book',
            label: 'База знаний',
            action: 'route',
            to: '/faq',
            columns: [{
                key: 'guides',
                title: 'Инструкции',
                links: [
                    {key: 'guides-ps', label: 'PlayStation', action: 'route', to: '/faq?tag=ps'},
                    {key: 'guides-xbox', label: 'Xbox', action: 'route', to: '/faq?tag=xbox'},
                    {key: 'guides-all', label: 'Все инструкции', action: 'route', to: '/faq'}
                ]
            }]
        },
        {key: 'contacts', icon: 'chat', label: 'Контакты', note: 'Связаться с поддержкой и узнать о магазине', action: 'route', to: '/info/contact'}
    ];

    const fixedRoutes = buyers.map((item) => item.to);
    const extras = (pageLinks || [])
        .filter((link) => !fixedRoutes.includes(link.to))
        .map((link) => ({...link, icon: 'doc', action: 'route', extra: true}));

    return [
        {key: 'shop', title: 'Магазин', items: shop},
        {key: 'buyers', title: 'Покупателям', items: [...buyers, ...extras]}
    ].filter((group) => group.items.length);
};

export const menuTarget = (item) => {
    if (item.action === 'storefront') return '/';
    if (item.action === 'section') return item.section.route;

    return item.to;
};
