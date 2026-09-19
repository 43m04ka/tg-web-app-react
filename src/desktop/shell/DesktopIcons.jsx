import React from 'react';

export const SearchIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <circle cx="10.6" cy="10.6" r="6.7" stroke="currentColor" strokeWidth="2"/>
        <path d="m15.6 15.6 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

export const BasketIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M4 7h16l-1.4 11.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L4 7Z"
              stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/>
        <path d="M9 7V5.8A3 3 0 0 1 12 3a3 3 0 0 1 3 2.8V7"
              stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
    </svg>
);

export const UserIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <circle cx="12" cy="8.4" r="3.9" stroke="currentColor" strokeWidth="1.9"/>
        <path d="M4.6 20.2c.9-3.6 3.8-5.6 7.4-5.6s6.5 2 7.4 5.6"
              stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
    </svg>
);

export const ChevronIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="m6 9.5 6 6 6-6" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const GridIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <rect x="3.6" y="3.6" width="7" height="7" rx="2.2" fill="currentColor"/>
        <rect x="13.4" y="3.6" width="7" height="7" rx="2.2" fill="currentColor" opacity="0.62"/>
        <rect x="3.6" y="13.4" width="7" height="7" rx="2.2" fill="currentColor" opacity="0.62"/>
        <rect x="13.4" y="13.4" width="7" height="7" rx="2.2" fill="currentColor"/>
    </svg>
);

export const HeartIcon = (props) => (
    <svg viewBox="0 0 24 24" {...props}>
        <path
            d="M12 20.4c-.4 0-.8-.14-1.1-.4C7 16.8 3.4 13.7 3.4 10.1A4.7 4.7 0 0 1 12 7.4a4.7 4.7 0 0 1 8.6 2.7c0 3.6-3.6 6.7-7.5 9.9-.3.26-.7.4-1.1.4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
    </svg>
);

export const ShareIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M12 15V4m0 0L8.2 7.8M12 4l3.8 3.8" stroke="currentColor" strokeWidth="1.9"
              strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 13.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4.5" stroke="currentColor"
              strokeWidth="1.9" strokeLinecap="round"/>
    </svg>
);

export const LinkIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <rect x="9" y="9" width="11" height="11" rx="3" stroke="currentColor" strokeWidth="1.9"/>
        <path d="M15 6.5A2.5 2.5 0 0 0 12.5 4H7a3 3 0 0 0-3 3v5.5A2.5 2.5 0 0 0 6.5 15"
              stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
    </svg>
);
