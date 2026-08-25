import {request} from './client';

export const fetchCatalogProducts = (body, signal) =>
    request('/api/catalog/products', {method: 'POST', body, signal, retries: 1});

export const fetchCatalogFacets = (body, signal) =>
    request('/api/catalog/facets', {method: 'POST', body, signal, retries: 1});

export const searchProducts = (body, signal) =>
    request('/api/search/query', {method: 'POST', body, signal, retries: 0});
