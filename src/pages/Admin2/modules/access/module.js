import {lazy} from 'react';

export default {
    id: 'access',
    title: 'Доступ',
    group: 'tools',
    icon: 'exit',
    order: 95,
    routes: [
        {path: '/access', element: lazy(() => import('./AccessScreen'))},
    ],
    commands: [
        {
            id: 'access.sessions',
            title: 'Доступ: входы в админку',
            icon: 'exit',
            run: ({go}) => go('/access'),
        },
    ],
};
