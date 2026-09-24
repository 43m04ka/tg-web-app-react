import {useEffect, useState} from 'react';

const BREAKPOINTS = [
    {query: '(min-width: 1241px)', columns: 6},
    {query: '(min-width: 1041px)', columns: 5}
];

const FALLBACK = 4;

const read = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return BREAKPOINTS[0].columns;
    return BREAKPOINTS.find((item) => window.matchMedia(item.query).matches)?.columns ?? FALLBACK;
};

export function useGridColumns() {
    const [columns, setColumns] = useState(read);

    useEffect(() => {
        const lists = BREAKPOINTS.map((item) => window.matchMedia(item.query));
        const update = () => setColumns(read());

        lists.forEach((list) => list.addEventListener('change', update));
        return () => lists.forEach((list) => list.removeEventListener('change', update));
    }, []);

    return columns;
}
