import {lazy} from 'react';

const screen = lazy(() => import('./StorefrontScreen'));

export default {
    id: 'storefront',
    title: 'Витрина',
    group: 'storefront',
    icon: 'storefront',
    order: 55,
    routes: [
        {path: '/storefront', element: screen},
        {path: '/storefront/page/:pageId', element: screen},
    ],
    commands: [
        {
            id: 'storefront.pages',
            title: 'Витрина: страницы, блоки и баннеры',
            icon: 'storefront',
            run: ({go}) => go('/storefront'),
        },
    ],
};
