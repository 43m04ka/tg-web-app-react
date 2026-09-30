import {lazy} from 'react';

const screen = lazy(() => import('./PagesScreen'));

export default {
    id: 'pages',
    title: 'Текстовые страницы',
    group: 'storefront',
    icon: 'pages',
    order: 57.5,
    routes: [
        {path: '/pages', element: screen},
        {path: '/pages/:id', element: screen},
    ],
    commands: [
        {
            id: 'pages.list',
            title: 'Текстовые страницы: список',
            icon: 'pages',
            run: ({go}) => go('/pages'),
        },
        {
            id: 'pages.new',
            title: 'Текстовая страница: создать',
            icon: 'pages',
            run: ({go}) => go('/pages/new'),
        },
    ],
};
