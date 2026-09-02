import {lazy} from 'react';

export default {
    id: 'media',
    title: 'Медиатека',
    group: 'tools',
    icon: 'media',
    order: 80,
    routes: [
        {path: '/media', element: lazy(() => import('./MediaScreen'))},
    ],
    commands: [
        {
            id: 'media.open',
            title: 'Медиатека: файлы витрины',
            icon: 'media',
            run: ({go}) => go('/media'),
        },
    ],
};
