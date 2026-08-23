import React from 'react';

const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
};

export const HeartIcon = (props) => (
    <svg viewBox="0 0 24 24" {...props}>
        <path
            d="M12 20s-7.2-4.4-7.2-9.3A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.2 2.5C19.2 15.6 12 20 12 20z"
            {...stroke}
        />
    </svg>
);

export const OrdersIcon = (props) => (
    <svg viewBox="0 0 24 24" {...props}>
        <path d="M6 3.6h12a1.4 1.4 0 0 1 1.4 1.4v14a1.4 1.4 0 0 1-1.4 1.4H6A1.4 1.4 0 0 1 4.6 19V5A1.4 1.4 0 0 1 6 3.6z" {...stroke}/>
        <path d="M8.4 8.4h7.2M8.4 12h7.2M8.4 15.6h4.2" {...stroke}/>
    </svg>
);

export const SupportIcon = (props) => (
    <svg viewBox="0 0 24 24" {...props}>
        <path d="M20 12a8 8 0 1 0-3.1 6.3L20 19.4l-1-3a7.9 7.9 0 0 0 1-4.4z" {...stroke}/>
        <path d="M9.7 9.6a2.4 2.4 0 1 1 3.2 2.3c-.6.2-.9.7-.9 1.3v.4" {...stroke}/>
        <circle cx="12" cy="16.6" r="0.9" fill="currentColor" stroke="none"/>
    </svg>
);

export const ChannelIcon = (props) => (
    <svg viewBox="0 0 24 24" {...props}>
        <path d="M20.4 4.2 3.9 10.6c-.8.3-.8 1.4 0 1.7l4 1.4 1.6 4.9c.2.7 1.2.8 1.6.2l2.2-3 4 3c.6.4 1.4.1 1.6-.6l2.4-13c.1-.7-.5-1.3-1.2-1z" {...stroke}/>
        <path d="m8 13.7 9.6-6.8-6.1 7.8" {...stroke}/>
    </svg>
);

export const CommunityIcon = (props) => (
    <svg viewBox="0 0 24 24" {...props}>
        <circle cx="9.2" cy="9.4" r="3.1" {...stroke}/>
        <path d="M3.8 19.4a5.4 5.4 0 0 1 10.8 0" {...stroke}/>
        <path d="M15.6 7a3 3 0 0 1 0 5.8M17 19.4a5.4 5.4 0 0 0-1.5-3.8" {...stroke}/>
    </svg>
);

export const DocIcon = (props) => (
    <svg viewBox="0 0 24 24" {...props}>
        <path d="M13.4 3.6H7A1.4 1.4 0 0 0 5.6 5v14A1.4 1.4 0 0 0 7 20.4h10a1.4 1.4 0 0 0 1.4-1.4V8.6z" {...stroke}/>
        <path d="M13.4 3.6v5h5M8.8 13h6.4M8.8 16.4h4.4" {...stroke}/>
    </svg>
);

export const ShieldIcon = (props) => (
    <svg viewBox="0 0 24 24" {...props}>
        <path d="M12 3.5 5.6 6v5.6c0 4 2.7 7.4 6.4 8.9 3.7-1.5 6.4-4.9 6.4-8.9V6z" {...stroke}/>
        <path d="m9.3 12.2 1.9 1.9 3.5-3.9" {...stroke}/>
    </svg>
);

export const GuideIcon = (props) => (
    <svg viewBox="0 0 24 24" {...props}>
        <path d="M4.6 5.4A16 16 0 0 1 12 7a16 16 0 0 1 7.4-1.6v12A16 16 0 0 0 12 19a16 16 0 0 0-7.4-1.6z" {...stroke}/>
        <path d="M12 7v12" {...stroke}/>
    </svg>
);

export const ChevronIcon = (props) => (
    <svg viewBox="0 0 24 24" {...props}>
        <path d="m9.5 5.5 6.5 6.5-6.5 6.5" {...stroke} strokeWidth={2}/>
    </svg>
);
