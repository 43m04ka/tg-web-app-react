import React from 'react';

export default function BackCircle({className, style, onClick}) {
    return (
        <button type="button" className={className} style={style} onClick={onClick} aria-label="Назад">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M14.5 19L7.5 12L14.5 5" stroke="currentColor" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </button>
    );
}
