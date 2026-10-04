import {lazy} from 'react';

export default {
    id: 'subscriptions',
    title: 'Подписки PS',
    group: 'goods',
    icon: 'services',
    order: 55,
    routes: [
        {path: '/subscriptions', element: lazy(() => import('./SubscriptionsScreen'))},
    ],
    commands: [
        {
            id: 'subscriptions.refresh',
            title: 'Подписки PS Plus, EA Play, GTA+: состав и цены',
            icon: 'services',
            run: ({go}) => go('/subscriptions'),
        },
    ],
};
