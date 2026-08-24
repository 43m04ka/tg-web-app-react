import {request, safeRequestResult} from './client';

export const fetchProduct = (productId, signal) =>
    request(`/api/product/${productId}`, {signal, retries: 1});

export const fetchRecommendations = (pageId, signal) =>
    safeRequestResult('/api/product/recommendations', {query: {pageId}, signal, retries: 1});

export const prepareShareMessage = (id, userId, signal) =>
    request('/api/product/prepareShareMessage', {query: {id, userId}, signal, retries: 0})
        .then((payload) => payload?.id ?? null);
