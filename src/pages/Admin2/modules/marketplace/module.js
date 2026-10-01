import {lazy} from 'react';

const screen = lazy(() => import('./MarketplaceScreen'));

export default {
    id: 'marketplace',
    title: 'Маркетплейсы',
    group: 'money',
    icon: 'orders',
    order: 25,
    routes: [
        {path: '/marketplace', element: screen},
        {path: '/marketplace/:id', element: screen},
    ],
};
