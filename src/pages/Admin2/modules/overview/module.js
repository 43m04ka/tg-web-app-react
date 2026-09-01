import {lazy} from 'react';

export default {
    id: 'overview',
    title: 'Обзор',
    group: 'money',
    icon: 'overview',
    order: 10,
    routes: [
        {path: '/', element: lazy(() => import('./OverviewScreen'))},
    ],
    commands: [],
};
