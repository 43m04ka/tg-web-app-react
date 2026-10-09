import {apiFetch} from './client';

export const sendMarketplaceOrder = async (order) => {
    const response = await apiFetch('/api/order/marketplace', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(order)
    });

    const data = await response.json().catch(() => ({}));

    return {...data, ok: response.ok, httpStatus: response.status};
};
