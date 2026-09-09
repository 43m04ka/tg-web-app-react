import {lazy} from 'react';

export default {
    id: 'payments',
    title: 'Оплата',
    group: 'money',
    icon: 'pricing',
    order: 25,
    routes: [
        {path: '/payments', element: lazy(() => import('./PaymentsScreen'))},
    ],
    commands: [
        {
            id: 'payments.matrix',
            title: 'Оплата: способы и площадки',
            icon: 'pricing',
            run: ({go}) => go('/payments'),
        },
    ],
};
