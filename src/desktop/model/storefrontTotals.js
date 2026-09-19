import {useEffect, useRef, useState} from 'react';
import {fetchCatalogProducts} from '../../shared/api/catalog';

const totals = new Map();
const listeners = new Set();

const keyOf = (query) => JSON.stringify(query);

export const scopeFilter = (scopeId, botType) => (scopeId === null
    ? {allPages: true, botType}
    : {pageId: scopeId});

export const scopeQuery = (scopeId, {botType, sorting}) => ({
    ...scopeFilter(scopeId, botType),
    sorting
});

export const scopeQueries = (storefronts, options) => [
    {id: null, query: scopeQuery(null, options)},
    ...storefronts.map((item) => ({id: item.id, query: scopeQuery(item.id, options)}))
];

export const positionsLabel = (count) => {
    if (count === null) return 'считаем…';

    const tail = count % 10;
    const hundred = count % 100;
    const word = tail === 1 && hundred !== 11
        ? 'позиция'
        : (tail >= 2 && tail <= 4 && (hundred < 12 || hundred > 14) ? 'позиции' : 'позиций');

    return `${count.toLocaleString('ru-RU')} ${word}`;
};

const load = (query) => {
    const key = keyOf(query);
    if (totals.has(key)) return;

    totals.set(key, null);

    fetchCatalogProducts({...query, page: 1})
        .then((payload) => {
            totals.set(key, Number(payload?.total) || 0);
            listeners.forEach((listener) => listener());
        })
        .catch(() => totals.delete(key));
};

export function useScopeTotals(queries, {enabled = true} = {}) {
    const [, bump] = useState(0);
    const queriesRef = useRef(queries);
    queriesRef.current = queries;

    const stamp = keyOf(queries.map((item) => item.query));

    useEffect(() => {
        if (!enabled) return undefined;

        const onChange = () => bump((value) => value + 1);
        listeners.add(onChange);
        queriesRef.current.forEach((item) => load(item.query));

        return () => {
            listeners.delete(onChange);
        };
    }, [stamp, enabled]);

    return new Map(queries.map((item) => [item.id, totals.get(keyOf(item.query)) ?? null]));
}
