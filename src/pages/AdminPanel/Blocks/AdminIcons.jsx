import React from 'react';

const base = {
    viewBox: '0 0 24 24',
    width: 18,
    height: 18,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

export const HomeIcon = () => (
    <svg {...base}>
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10h14V10" />
    </svg>
);

export const BoxIcon = () => (
    <svg {...base}>
        <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
    </svg>
);

export const LayersIcon = () => (
    <svg {...base}>
        <path d="M12 3l9 5-9 5-9-5 9-5Z" />
        <path d="M3 13l9 5 9-5" />
    </svg>
);

export const FileIcon = () => (
    <svg {...base}>
        <path d="M6 2h9l5 5v15H6Z" />
        <path d="M14 2v6h6" />
    </svg>
);

export const SearchIcon = () => (
    <svg {...base}>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M20 20l-4.35-4.35" />
    </svg>
);

export const TagIcon = () => (
    <svg {...base}>
        <path d="M20.6 12.6 12 21.2 2.8 12 11.4 3.4H20.6Z" />
        <circle cx="16.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
);

export const ReceiptIcon = () => (
    <svg {...base}>
        <path d="M5 2h14v20l-2.5-1.5L14 22l-2-1.5L10 22l-2.5-1.5L5 22Z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
);

export const TicketIcon = () => (
    <svg {...base}>
        <path d="M3 8a2 2 0 0 0 0 4 2 2 0 0 1 0 4H2V6h1a2 2 0 0 1 0 2Z" transform="translate(1)" />
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M9 6v12" strokeDasharray="2 3" />
    </svg>
);

export const MegaphoneIcon = () => (
    <svg {...base}>
        <path d="M3 11v2a2 2 0 0 0 2 2h1l3 5V6l-3 5H5a2 2 0 0 0-2 2Z" />
        <path d="M13 8a4 4 0 0 1 0 8" />
        <path d="M17 5a8 8 0 0 1 0 14" />
    </svg>
);

export const ServerIcon = () => (
    <svg {...base}>
        <rect x="3" y="4" width="18" height="6" rx="1.5" />
        <rect x="3" y="14" width="18" height="6" rx="1.5" />
        <path d="M7 7h.01M7 17h.01" />
    </svg>
);
