import {lazy} from 'react';

export default {
    id: 'media',
    title: 'Хостинг',
    group: 'tools',
    icon: 'media',
    order: 80,
    routes: [
        {path: '/media', element: lazy(() => import('./MediaScreen'))},
    ],
    commands: [
        {
            id: 'media.open',
            title: 'Хостинг: файлы витрины',
            icon: 'media',
            run: ({go}) => go('/media'),
        },
    ],
};
