import React from 'react';

export default function BackPill({className, style, onClick, label = 'Назад'}) {
    return (
        <button type="button" className={className} style={style} onClick={onClick}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M15 19 8 12l7-7"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span>{label}</span>
        </button>
    );
}
