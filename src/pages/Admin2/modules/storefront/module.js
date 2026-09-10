import {lazy} from 'react';

const screen = lazy(() => import('./StorefrontScreen'));
const banners = lazy(() => import('./BannersScreen'));
const start = lazy(() => import('./StartPagesScreen'));
const texts = lazy(() => import('./TextsScreen'));
const popular = lazy(() => import('./PopularScreen'));

export default {
    id: 'storefront',
    title: 'Витрина',
    group: 'storefront',
    icon: 'storefront',
    order: 55,
    routes: [
        {path: '/storefront', element: screen},
        {path: '/storefront/banners', element: banners},
        {path: '/storefront/start', element: start},
        {path: '/storefront/popular', element: popular},
        {path: '/storefront/texts', element: texts},
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
        {
            id: 'storefront.start',
            title: 'Витрина: стартовый экран',
            icon: 'storefront',
            run: ({go}) => go('/storefront/start'),
        },
        {
            id: 'storefront.popular',
            title: 'Витрина: популярное на старте',
            icon: 'storefront',
            run: ({go}) => go('/storefront/popular'),
        },
        {
            id: 'storefront.texts',
            title: 'Витрина: инфоблоки и подсказки поиска',
            icon: 'storefront',
            run: ({go}) => go('/storefront/texts'),
        },
    ],
};
