import {lazy} from 'react';

const screen = lazy(() => import('./DesktopScreen'));

export default {
    id: 'desktop',
    title: 'ПК-версия',
    group: 'storefront',
    icon: 'desktop',
    order: 54,
    routes: [
        {path: '/desktop', element: screen},
    ],
    commands: [
        {
            id: 'desktop.storefront',
            title: 'ПК-версия: главная, сводные каталоги и баннеры',
            icon: 'desktop',
            run: ({go}) => go('/desktop'),
        },
    ],
};
