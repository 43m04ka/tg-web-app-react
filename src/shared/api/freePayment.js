import {API_BASE_URL} from '../config/env';
import {ensurePaymentNetwork, VPN_BLOCKED} from '../lib/paymentNetwork';

export const createFreePayment = async ({email, amount}) => {
    if (!(await ensurePaymentNetwork())) return VPN_BLOCKED;

    const response = await fetch(`${API_BASE_URL}/api/payment/free`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, amount})
    });

    const data = await response.json().catch(() => ({}));

    return {...data, ok: response.ok, httpStatus: response.status};
};

export const fetchFreePaymentStatus = async (id) => {
    const response = await fetch(
        `${API_BASE_URL}/api/payment/free/status?id=${encodeURIComponent(id)}&time=${Date.now()}`
    );

    if (!response.ok) return null;

    return response.json().catch(() => null);
};
