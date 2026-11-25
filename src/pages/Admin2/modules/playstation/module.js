import {lazy} from 'react';

export default {
    id: 'playstation',
    title: 'PlayStation',
    group: 'storefront',
    icon: 'playstation',
    order: 58,
    routes: [
        {path: '/playstation', element: lazy(() => import('./PlayStationScreen'))},
    ],
    commands: [],
};
