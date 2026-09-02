import {lazy} from 'react';
import {fetchTree} from './api';

const screen = lazy(() => import('./ServicesScreen'));

export default {
    id: 'services',
    title: 'Сервисы',
    group: 'storefront',
    icon: 'services',
    order: 60,
    routes: [
        {path: '/services', element: screen},
        {path: '/services/:brandId', element: screen},
    ],
    commands: [],
    search: async (query) => {
        const answer = await fetchTree();
        const needle = query.toLowerCase();

        return (answer?.result || [])
            .filter((brand) => String(brand.name || '').toLowerCase().includes(needle))
            .slice(0, 5)
            .map((brand) => ({
                id: String(brand.id),
                title: brand.name,
                hint: `${(brand.offers || []).length} предложений`,
                icon: 'services',
                path: `/services/${brand.id}`,
            }));
    },
};
