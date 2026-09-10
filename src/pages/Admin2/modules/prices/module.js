import {lazy} from 'react';

export default {
    id: 'prices',
    title: 'Цены',
    group: 'goods',
    icon: 'pricing',
    order: 50,
    routes: [
        {path: '/prices', element: lazy(() => import('./PricesScreen'))},
    ],
    commands: [
        {
            id: 'prices.rules',
            title: 'Цены: правила наценки',
            icon: 'pricing',
            run: ({go}) => go('/prices'),
        },
    ],
};
