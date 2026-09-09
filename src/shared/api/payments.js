import {request} from './client';

export const fetchPaymentMethods = async ({platform, scenario, pageId, pageType}, signal) => {
    const payload = await request('/api/payment/methods', {
        query: {platform, scenario, pageId, pageType},
        signal,
        retries: 1
    });

    return Array.isArray(payload?.methods) ? payload.methods : null;
};
