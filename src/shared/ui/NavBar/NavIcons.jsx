import React from 'react';

const strokeProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
};

export function HomeIcon({className}) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path {...strokeProps} d="M3.5 10.1 12 3.3l8.5 6.8v10.6h-17z"/>
            <path {...strokeProps} className="drawn" d="M9.3 20.7v-7.6h5.4v7.6"/>
        </svg>
    );
}

export function SearchIcon({className}) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <g className="spun">
                <circle {...strokeProps} cx="10.6" cy="10.6" r="6.7"/>
                <path {...strokeProps} d="m15.6 15.6 5 5"/>
            </g>
        </svg>
    );
}

export function BasketIcon({className}) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path {...strokeProps} d="M8.6 8.2V6.5a3.4 3.4 0 0 1 6.8 0v1.7"/>
            <path {...strokeProps} d="M3.7 8.2h16.6"/>
            <path
                {...strokeProps}
                d="M5.3 8.2 6.4 19a2 2 0 0 0 2 1.8h7.2a2 2 0 0 0 2-1.8l1.1-10.8"
            />
            <path {...strokeProps} className="drawn" d="M9.7 11.7v1.9m4.6-1.9v1.9"/>
        </svg>
    );
}

export function MoreIcon({className}) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <rect className="tile" x="3.6" y="3.6" width="7.7" height="7.7" rx="2.2" fill="currentColor"/>
            <rect className="tile" x="12.7" y="3.6" width="7.7" height="7.7" rx="2.2" fill="currentColor"/>
            <rect className="tile" x="3.6" y="12.7" width="7.7" height="7.7" rx="2.2" fill="currentColor"/>
            <rect className="tile" x="12.7" y="12.7" width="7.7" height="7.7" rx="2.2" fill="currentColor"/>
        </svg>
    );
}

export function ChevronIcon({className}) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m5 9 7 7 7-7"
            />
        </svg>
    );
}
