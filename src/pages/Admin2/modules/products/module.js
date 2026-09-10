import {lazy} from 'react';
import {fetchProducts} from './api';

const screen = lazy(() => import('./ProductsScreen'));

export default {
    id: 'products',
    title: 'Товары',
    group: 'goods',
    icon: 'products',
    order: 30,
    routes: [
        {path: '/products', element: screen},
        {path: '/products/:id', element: screen},
    ],
    commands: [
        {
            id: 'products.onSale',
            title: 'Товары: снятые с продажи',
            icon: 'products',
            run: ({go}) => go('/products?onSale=false'),
        },
        {
            id: 'products.hidden',
            title: 'Товары: скрытые карточки',
            icon: 'products',
            run: ({go}) => go('/products?visibility=hidden'),
        },
    ],
    search: async (query) => {
        const answer = await fetchProducts({search: query, page: 1, pageSize: 5});

        return (answer?.items || []).map((item) => ({
            id: String(item.id),
            title: item.name,
            hint: `${item.platform || ''} ${item.price ? `· ${item.price} ₽` : ''}`.trim(),
            icon: 'products',
            path: `/products/${item.id}`,
        }));
    },
};
