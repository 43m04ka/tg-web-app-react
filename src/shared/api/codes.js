import {preparePaymentNetwork} from '../lib/paymentNetwork';
import {withVkGroup} from '../lib/vkOrder';
import {apiFetch, requestResult} from './client';
import {withLogin} from '../lib/loginGate';

export const fetchCodeCatalog = (signal) =>
    requestResult('/api/codes/catalog', {signal, retries: 2});

export const createCodeOrder = withLogin(async (payload) => {
    await preparePaymentNetwork();

    const response = await apiFetch('/api/codes/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(withVkGroup(payload))
    });

    const data = await response.json().catch(() => ({}));

    return {...data, ok: response.ok, httpStatus: response.status};
});
