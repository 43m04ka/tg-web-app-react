import {API_BASE_URL} from '../config/env';
import {ensurePaymentNetwork, VPN_BLOCKED} from '../lib/paymentNetwork';
import {requestResult} from './client';

export const fetchCodeCatalog = (signal) =>
    requestResult('/api/codes/catalog', {signal, retries: 2});

export const createCodeOrder = async (payload) => {
    if (!(await ensurePaymentNetwork())) return VPN_BLOCKED;

    const response = await fetch(`${API_BASE_URL}/api/codes/create`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    return {...data, ok: response.ok, httpStatus: response.status};
};
