import {requestResult} from './client';

const cache = new Map();

export const peekSubscriptionInfo = (catalogId) => cache.get(catalogId)?.value ?? null;

export const loadSubscriptionInfo = (catalogId) => {
    const ready = cache.get(catalogId);
    if (ready) return ready.promise;

    const promise = requestResult('/api/structure/subscriptionInfo', {query: {catalogId}, retries: 1})
        .then((value) => {
            cache.set(catalogId, {promise, value});
            return value;
        })
        .catch((error) => {
            cache.delete(catalogId);
            throw error;
        });

    cache.set(catalogId, {promise, value: null});
    return promise;
};
