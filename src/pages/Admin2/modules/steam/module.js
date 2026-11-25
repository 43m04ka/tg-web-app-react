import {lazy} from 'react';

export default {
    id: 'steam',
    title: 'Steam',
    group: 'storefront',
    icon: 'steam',
    order: 60,
    routes: [
        {path: '/steam', element: lazy(() => import('./SteamScreen'))},
    ],
    commands: [
        {
            id: 'steam.rates',
            title: 'Steam: проценты и калькулятор',
            icon: 'steam',
            run: ({go}) => go('/steam'),
        },
    ],
};
