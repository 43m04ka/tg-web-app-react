import {API_BASE_URL} from '../config/env';
import {request} from './client';

export const createOrder = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/api/order/create`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    return {...data, ok: response.ok, httpStatus: response.status};
};

export const fetchOrderStatus = (orderId, signal) =>
    request('/api/payment/status', {query: {id: orderId}, signal, retries: 0});

export const cancelOrderPayment = async (orderId, userId) => {
    const response = await fetch(`${API_BASE_URL}/api/payment/cancel`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({orderId, userId})
    });

    const data = await response.json().catch(() => ({}));

    return {...data, ok: response.ok, httpStatus: response.status};
};
