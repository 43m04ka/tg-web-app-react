import {lazy} from 'react';

const screen = lazy(() => import('./CatalogsScreen'));

export default {
    id: 'catalogs',
    title: 'Каталоги',
    group: 'goods',
    icon: 'catalogs',
    order: 35,
    routes: [
        {path: '/catalogs', element: screen},
        {path: '/catalogs/:id', element: screen},
    ],
    commands: [
        {
            id: 'catalogs.list',
            title: 'Каталоги и парсинг',
            icon: 'catalogs',
            run: ({go}) => go('/catalogs'),
        },
    ],
};
