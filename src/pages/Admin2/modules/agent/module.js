import {lazy} from 'react';

export default {
    id: 'agent',
    title: 'Агент',
    group: 'tools',
    icon: 'agent',
    order: 96,
    routes: [
        {path: '/agent', element: lazy(() => import('./AgentScreen'))},
    ],
    commands: [
        {
            id: 'agent.plans',
            title: 'Агент: текущий план и история',
            icon: 'agent',
            run: ({go}) => go('/agent'),
        },
    ],
};
