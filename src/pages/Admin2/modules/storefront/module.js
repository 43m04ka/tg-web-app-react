import {lazy} from 'react';

const screen = lazy(() => import('./StorefrontScreen'));
const banners = lazy(() => import('./BannersScreen'));

export default {
    id: 'storefront',
    title: 'Витрина',
    group: 'storefront',
    icon: 'storefront',
    order: 55,
    routes: [
        {path: '/storefront', element: screen},
        {path: '/storefront/banners', element: banners},
        {path: '/storefront/page/:pageId', element: screen},
    ],
    commands: [
        {
            id: 'storefront.pages',
            title: 'Витрина: страницы и блоки',
            icon: 'storefront',
            run: ({go}) => go('/storefront'),
        },
        {
            id: 'storefront.banners',
            title: 'Витрина: баннеры карусели',
            icon: 'storefront',
            run: ({go}) => go('/storefront/banners'),
        },
    ],
};
