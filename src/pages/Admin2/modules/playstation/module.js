import {lazy} from 'react';

export default {
    id: 'playstation',
    title: 'PlayStation',
    group: 'storefront',
    icon: 'playstation',
    order: 55,
    routes: [
        {path: '/playstation', element: lazy(() => import('./PlayStationScreen'))},
    ],
    commands: [],
};
