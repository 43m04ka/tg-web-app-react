import {lazy} from 'react';

const screen = lazy(() => import('./OrdersScreen'));

export default {
    id: 'orders',
    title: 'Заказы',
    group: 'money',
    icon: 'orders',
    order: 20,
    routes: [
        {path: '/orders', element: screen},
        {path: '/orders/:id', element: screen},
    ],
    commands: [
        {
            id: 'orders.find',
            title: 'Найти заказ по номеру',
            icon: 'orders',
            prompt: 'Номер заказа',
            run: ({go, value}) => go(`/orders/${String(value).trim()}`),
        },
        {
            id: 'orders.trouble',
            title: 'Заказы: требуют внимания',
            icon: 'orders',
            run: ({go}) => go('/orders?trouble=yes'),
        },
    ],
};
