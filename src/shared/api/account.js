import {request, requestResult} from './client';

export const fetchOrderHistory = (userId, signal) =>
    requestResult('/api/order/history', {query: {userId}, signal, retries: 1});

export const fetchFavorites = (userId, signal) =>
    requestResult(`/api/favorite/allFavoriteProducts/${userId}`, {signal, retries: 1});

export const removeFavorite = (userId, cardId, signal) =>
    request('/api/favorite/deleteProduct', {
        method: 'POST',
        body: {userId, cardId},
        signal,
        retries: 0
    });

export const addFavorite = (userId, cardId, signal) =>
    request('/api/favorite/addProduct', {
        method: 'POST',
        body: {userId, cardId},
        signal,
        retries: 0
    });
