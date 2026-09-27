import {lazy} from 'react';

export default {
    id: 'marketplace',
    title: 'Маркетплейсы',
    group: 'money',
    icon: 'orders',
    order: 25,
    routes: [
        {path: '/marketplace', element: lazy(() => import('./MarketplaceScreen'))},
    ],
};
