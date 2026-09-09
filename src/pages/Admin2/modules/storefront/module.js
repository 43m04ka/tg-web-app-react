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
        {path: '/storefront/:pageId', element: screen},
    ],
    commands: [
        {
            id: 'storefront.pages',
            title: 'Витрина: страницы и блоки',
            icon: 'storefront',
            run: ({go}) => go('/storefront'),
        },
    ],
};
