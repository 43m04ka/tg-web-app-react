import {lazy} from 'react';

const start = lazy(() => import('../storefront/StartPagesScreen'));
const popular = lazy(() => import('../storefront/PopularScreen'));

export default {
    id: 'start',
    title: 'Стартовый экран',
    group: 'storefront',
    icon: 'storefront',
    order: 56,
    routes: [
        {path: '/start', element: start},
        {path: '/start/popular', element: popular},
    ],
    commands: [
        {
            id: 'start.pages',
            title: 'Стартовый экран: страницы',
            icon: 'storefront',
            run: ({go}) => go('/start'),
        },
        {
            id: 'start.popular',
            title: 'Стартовый экран: популярное',
            icon: 'storefront',
            run: ({go}) => go('/start/popular'),
        },
    ],
};
