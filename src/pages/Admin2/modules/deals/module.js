import {lazy} from 'react';

const screen = lazy(() => import('../storefront/TextsScreen'));

export default {
    id: 'deals',
    title: 'Акции',
    group: 'storefront',
    icon: 'promo',
    order: 57,
    routes: [
        {path: '/deals', element: screen},
    ],
    commands: [
        {
            id: 'deals.open',
            title: 'Акции: тексты на витрине',
            icon: 'promo',
            run: ({go}) => go('/deals'),
        },
    ],
};
