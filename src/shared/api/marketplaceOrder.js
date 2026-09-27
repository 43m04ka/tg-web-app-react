import {API_BASE_URL} from '../config/env';

export const sendMarketplaceOrder = async (order) => {
    const response = await fetch(`${API_BASE_URL}/api/order/marketplace`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(order)
    });

    const data = await response.json().catch(() => ({}));

    return {...data, ok: response.ok, httpStatus: response.status};
};
