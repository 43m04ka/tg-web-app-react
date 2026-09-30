import {subscriptionRoute} from '../../shared/lib/pageRoutes';
import {textPageRoute} from '../../shared/textPages/textPageModel';
import {navLabel} from './desktopNav';

const SUBSCRIPTIONS = [
    {suffix: 'psplus', label: 'PS Plus'},
    {suffix: 'eaplay', label: 'EA Play'},
    {suffix: 'gamepass', label: 'Game Pass'}
];

const subscriptionsOf = (catalogs, pageId) => SUBSCRIPTIONS
    .map(({suffix, label}) => {
        const catalog = (catalogs || []).find((item) =>
            item.structurePageId === pageId && String(item.path || '').endsWith(`_${suffix}`));

        return catalog ? {key: `${pageId}-${suffix}`, label, path: catalog.path} : null;
    })
    .filter(Boolean);

export const menuGroups = ({storefronts, sections, catalogs, textPages}) => {
    const shops = (storefronts || []).map((shop) => ({
        key: `shop-${shop.id}`,
        title: navLabel(shop.type, shop.label),
        items: [
            {key: `${shop.id}-games`, label: 'Игры', action: 'storefront', shop},
            ...subscriptionsOf(catalogs, shop.id).map((item) => ({
                ...item,
                action: 'subscription',
                shop,
                to: subscriptionRoute(item.path)
            }))
        ]
    }));

    const services = {
        key: 'services',
        title: 'Активация и оплата',
        items: [
            ...(sections || []).map((section) => ({
                key: section.key,
                label: section.label,
                action: 'section',
                section
            })),
            {key: 'activate', label: 'Активация заказа', action: 'route', to: '/activate'},
            {key: 'pay', label: 'Оплата Геймворд', action: 'route', to: '/pay'}
        ]
    };

    const info = {
        key: 'info',
        title: 'Информация',
        items: [
            {key: 'news', label: 'Новости', action: 'route', to: '/news'},
            {key: 'guides', label: 'Инструкции', action: 'route', to: '/faq'},
            ...(textPages || []).map((page) => ({
                key: `page-${page.id}`,
                label: page.title,
                action: 'route',
                to: textPageRoute(page)
            }))
        ]
    };

    return [...shops, services, info].filter((group) => group.items.length);
};
