import {lazy} from 'react';

const screen = lazy(() => import('./StorefrontScreen'));

export default {
    id: 'storefront',
    title: 'Витрины',
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
            title: 'Витрины: каталоги и баннеры мобильной и ПК-версии',
            icon: 'storefront',
            run: ({go}) => go('/storefront'),
        },
    ],
};
