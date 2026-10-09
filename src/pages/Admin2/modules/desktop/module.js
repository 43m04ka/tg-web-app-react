import {lazy} from 'react';

const screen = lazy(() => import('./DesktopScreen'));

export default {
    id: 'desktop',
    title: 'Главная (ПК)',
    group: 'storefront',
    icon: 'desktop',
    order: 54,
    routes: [
        {path: '/desktop', element: screen},
    ],
    commands: [
        {
            id: 'desktop.storefront',
            title: 'Главная (ПК): сводные каталоги и баннеры',
            icon: 'desktop',
            run: ({go}) => go('/desktop'),
        },
    ],
};
