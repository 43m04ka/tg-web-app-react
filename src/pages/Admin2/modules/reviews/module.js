import {lazy} from 'react';

export default {
    id: 'reviews', title: 'Отзывы по ссылке', group: 'tools', icon: 'orders', order: 82,
    routes: [{path: '/reviews', element: lazy(() => import('./ReviewsScreen'))}]
};
