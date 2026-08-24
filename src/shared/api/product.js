import {request, safeRequestResult} from './client';

export const fetchProduct = (productId, signal) =>
    request(`/api/product/${productId}`, {signal, retries: 1});

export const fetchRecommendations = (pageId, signal) =>
    safeRequestResult('/api/product/recommendations', {query: {pageId}, signal, retries: 1});
