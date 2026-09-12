import {lazy} from 'react';

export default {
    id: 'prices',
    title: 'Сетки цен',
    group: 'goods',
    icon: 'pricing',
    order: 50,
    routes: [
        {path: '/prices', element: lazy(() => import('./PricesScreen'))},
    ],
    commands: [
        {
            id: 'prices.rules',
            title: 'Сетки цен: правила наценки',
            icon: 'pricing',
            run: ({go}) => go('/prices'),
        },
    ],
};
