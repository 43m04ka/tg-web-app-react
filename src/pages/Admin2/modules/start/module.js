import {lazy} from 'react';

const start = lazy(() => import('../storefront/MobileMainScreen'));

export default {
    id: 'start',
    title: 'Главная (МОБ)',
    group: 'storefront',
    icon: 'storefront',
    order: 54.5,
    routes: [
        {path: '/start', element: start},
        {path: '/popular', element: start},
    ],
    commands: [
        {
            id: 'start.pages',
            title: 'Главная (МОБ): стартовый экран и популярное',
            icon: 'storefront',
            run: ({go}) => go('/start'),
        },
    ],
};
