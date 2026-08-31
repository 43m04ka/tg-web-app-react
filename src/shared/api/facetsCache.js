import {fetchCatalogFacets} from './catalog';

const EMPTY = {facets: null, price: null};

const cache = new Map();
const pending = new Map();

const normalize = (payload) => ({
    facets: payload?.facets || null,
    price: payload?.price || null
});

export const peekFacets = (scope) => cache.get(JSON.stringify(scope)) || EMPTY;

export const loadFacets = (scope) => {
    const key = JSON.stringify(scope);

    if (pending.has(key)) return pending.get(key);

    const request = fetchCatalogFacets(scope)
        .then((payload) => {
            const value = normalize(payload);
            cache.set(key, value);
            pending.delete(key);
            return value;
        })
        .catch((error) => {
            pending.delete(key);
            throw error;
        });

    pending.set(key, request);

    return request;
};
