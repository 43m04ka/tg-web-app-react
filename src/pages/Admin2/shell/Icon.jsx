import React from 'react';

const PATHS = {
    overview: 'M3 10.5 10 4l7 6.5M5.5 9.5V16h9V9.5',
    orders: 'M4 5.5h12M4 10h12M4 14.5h8',
    products: 'M10 3.5 16.5 7v6L10 16.5 3.5 13V7z M3.5 7 10 10.5 16.5 7 M10 10.5V16.5',
    catalogs: 'M3.5 5.5h5l1.5 2h6.5v7h-13z',
    pricing: 'M4 10.5 10.5 4H16v5.5L9.5 16z M13 7h.01',
    storefront: 'M4 8.5h12M4 8.5 5.5 4.5h9L16 8.5M5 8.5V16h10V8.5',
    steam: 'M10 2.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15z M12.4 5.1a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z M7.2 10.7a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4z M8.5 11.2 10.7 9',
    services: 'M10 3.5v13M3.5 10h13M6 6l8 8M14 6l-8 8',
    promo: 'M4 8V5.5h12V8a2 2 0 0 0 0 4v2.5H4V12a2 2 0 0 0 0-4z M10 6v8',
    broadcast: 'M4.5 9 16 4.5 13.5 16 9.5 11.5z M9.5 11.5 16 4.5',
    media: 'M3.5 5h13v10h-13z M3.5 12l4-3.5 3 2.5 3-2.5 3 3',
    settings: 'M10 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z M10 2.8v2M10 15.2v2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M2.8 10h2M15.2 10h2M4.9 15.1l1.4-1.4M13.7 6.3l1.4-1.4',
    kit: 'M3.5 3.5h6v6h-6z M10.5 3.5h6v6h-6z M3.5 10.5h6v6h-6z M10.5 10.5h6v6h-6z',
    tasks: 'M4 6.5h12M4 10h12M4 13.5h12',
    search: 'M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z M13.2 13.2 17 17',
    sun: 'M10 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M10 2v2M10 16v2M2 10h2M16 10h2M4.5 4.5l1.4 1.4M14.1 14.1l1.4 1.4M4.5 15.5l1.4-1.4M14.1 5.9l1.4-1.4',
    moon: 'M15.5 12.4A6.2 6.2 0 0 1 7.6 4.5a6.5 6.5 0 1 0 7.9 7.9z',
    exit: 'M12 6.5V4.5h-8v11h8v-2M8.5 10h8M14 7.5 16.5 10 14 12.5',
    chevron: 'M7.5 5 12.5 10l-5 5',
    cancel: 'M10 3.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z M7.5 7.5l5 5M12.5 7.5l-5 5',
    up: 'M5 12.5 10 7.5l5 5',
    down: 'M5 7.5 10 12.5l5-5',
};

export default function Icon({name, size = 16}) {
    const path = PATHS[name] || PATHS.tasks;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={path}/>
        </svg>
    );
}
