import {lazy} from 'react';

const screen = lazy(() => import('./PromoScreen'));

export default {
    id: 'promo',
    title: 'Промокоды',
    group: 'money',
    icon: 'promo',
    order: 27,
    routes: [
        {path: '/promo', element: screen},
        {path: '/promo/:id', element: screen},
    ],
    commands: [
        {
            id: 'promo.list',
            title: 'Промокоды: список',
            icon: 'promo',
            run: ({go}) => go('/promo'),
        },
        {
            id: 'promo.new',
            title: 'Промокод: завести новый',
            icon: 'promo',
            run: ({go}) => go('/promo/new'),
        },
    ],
};
