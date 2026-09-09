import {lazy} from 'react';

const screen = lazy(() => import('./BroadcastScreen'));

export default {
    id: 'broadcast',
    title: 'Рассылка',
    group: 'storefront',
    icon: 'broadcast',
    order: 70,
    routes: [
        {path: '/broadcast', element: screen},
    ],
    commands: [
        {
            id: 'broadcast.open',
            title: 'Рассылка в Telegram',
            icon: 'broadcast',
            run: ({go}) => go('/broadcast'),
        },
    ],
};
