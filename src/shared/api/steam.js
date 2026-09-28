import {API_BASE_URL} from '../config/env';
import {ensurePaymentNetwork, VPN_BLOCKED} from '../lib/paymentNetwork';

export const fetchSteamQuote = async (amount, signal) => {
    const response = await fetch(
        `${API_BASE_URL}/api/steam/quote?amount=${encodeURIComponent(amount)}&time=${Date.now()}`,
        {signal}
    );

    const data = await response.json().catch(() => ({}));

    return {...data, ok: response.ok};
};

export const createSteamOrder = async (payload) => {
    if (!(await ensurePaymentNetwork())) return VPN_BLOCKED;

    const response = await fetch(`${API_BASE_URL}/api/steam/create`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    return {...data, ok: response.ok, httpStatus: response.status};
};
