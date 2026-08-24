import {request, requestResult} from './client';

export const fetchBasket = (userId, signal) =>
    requestResult(`/api/basket/${userId}`, {signal, retries: 1});

export const addBasketProduct = (userId, cardId, signal) =>
    request('/api/basket/addProduct', {method: 'POST', body: {userId, cardId}, signal, retries: 0});

export const deleteBasketProduct = (userId, cardId, signal) =>
    request('/api/basket/deleteProduct', {method: 'POST', body: {userId, cardId}, signal, retries: 0});

export const updateBasketCount = (userId, cardId, count, signal) =>
    request('/api/basket/updateCountProduct', {
        method: 'POST',
        body: {userId, cardId, count},
        signal,
        retries: 0
    });
