import {http, httpGet, httpPost} from '../../platform/http';

export const fetchMarketplaceOrders = ({status, marketplace, search, page, pageSize}) => httpGet('/marketplace-orders', {
    query: {
        status: status || undefined,
        marketplace: marketplace || undefined,
        q: search || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize
    }
});

export const fetchMarketplaceOrder = (id) => httpGet(`/marketplace-orders/${id}`);

export const updateMarketplaceOrder = ({id, ...patch}) => httpPost('/marketplace-orders', {id, ...patch});

export const fetchMarketplaceFile = (id) => http(`/marketplace-orders/${id}/file`, {as: 'blob'});
