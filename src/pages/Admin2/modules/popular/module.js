import {lazy} from 'react';

const screen = lazy(() => import('../storefront/PopularScreen'));

export default {
    id: 'popular',
    title: 'Популярные позиции',
    group: 'storefront',
    icon: 'storefront',
    order: 56.5,
    routes: [
        {path: '/popular', element: screen},
    ],
    commands: [
        {
            id: 'popular.open',
            title: 'Популярные позиции',
            icon: 'storefront',
            run: ({go}) => go('/popular'),
        },
    ],
};
