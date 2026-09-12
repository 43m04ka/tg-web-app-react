import {lazy} from 'react';

const start = lazy(() => import('../storefront/StartPagesScreen'));

export default {
    id: 'start',
    title: 'Стартовый экран',
    group: 'storefront',
    icon: 'storefront',
    order: 56,
    routes: [
        {path: '/start', element: start},
    ],
    commands: [
        {
            id: 'start.pages',
            title: 'Стартовый экран: страницы',
            icon: 'storefront',
            run: ({go}) => go('/start'),
        },
    ],
};
