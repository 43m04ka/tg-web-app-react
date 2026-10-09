import {preparePaymentNetwork} from '../lib/paymentNetwork';
import {apiFetch, requestResult} from './client';

export const fetchCodeCatalog = (signal) =>
    requestResult('/api/codes/catalog', {signal, retries: 2});

export const createCodeOrder = async (payload) => {
    await preparePaymentNetwork();

    const response = await apiFetch('/api/codes/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    return {...data, ok: response.ok, httpStatus: response.status};
};
