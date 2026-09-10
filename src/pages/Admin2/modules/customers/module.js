import {lazy} from 'react';

const screen = lazy(() => import('./CustomersScreen'));

export default {
    id: 'customers',
    title: 'Покупатели',
    group: 'money',
    icon: 'orders',
    order: 22,
    routes: [
        {path: '/customers', element: screen},
        {path: '/customers/:id', element: screen},
    ],
    commands: [
        {
            id: 'customers.list',
            title: 'Покупатели',
            icon: 'orders',
            run: ({go}) => go('/customers'),
        },
    ],
};
