import React from 'react';

const Icon = ({children, ...rest}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
        {children}
    </svg>
);

export const FunnelIcon = (props) => (
    <Icon {...props}>
        <path d="M4 6h16l-6 7v5l-4 2v-7z"/>
    </Icon>
);

export const SortIcon = (props) => (
    <Icon {...props}>
        <path d="M7 5v14m0 0-3-3.4M7 19l3-3.4"/>
        <path d="M17 19V5m0 0-3 3.4M17 5l3 3.4"/>
    </Icon>
);

export const PlatformIcon = (props) => (
    <Icon {...props}>
        <rect x="2.5" y="8" width="19" height="9.5" rx="4.2"/>
        <path d="M7 11v3.5M5.25 12.75h3.5"/>
        <circle cx="16.4" cy="12" r="0.9" fill="currentColor" stroke="none"/>
        <circle cx="18.9" cy="14" r="0.9" fill="currentColor" stroke="none"/>
    </Icon>
);

export const TypeIcon = (props) => (
    <Icon {...props}>
        <rect x="3.5" y="4" width="17" height="16" rx="3"/>
        <path d="M3.5 9h17M9 9v11"/>
    </Icon>
);

export const GenreIcon = (props) => (
    <Icon {...props}>
        <path d="M12 4.5 14.2 9l5 .7-3.6 3.5.9 5-4.5-2.4L7.5 18.2l.9-5L4.8 9.7 9.8 9z"/>
    </Icon>
);

export const PriceIcon = (props) => (
    <Icon {...props}>
        <path d="M13.5 5H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6h-4.5"/>
        <path d="M12 3v18"/>
    </Icon>
);

export const LanguageIcon = (props) => (
    <Icon {...props}>
        <circle cx="12" cy="12" r="8.2"/>
        <path d="M3.8 12h16.4"/>
        <path d="M12 3.8c2.2 2.4 3.3 5.1 3.3 8.2s-1.1 5.8-3.3 8.2c-2.2-2.4-3.3-5.1-3.3-8.2s1.1-5.8 3.3-8.2z"/>
    </Icon>
);

export const PlayersIcon = (props) => (
    <Icon {...props}>
        <circle cx="9" cy="8.5" r="3"/>
        <path d="M3.8 19c0-2.9 2.3-5 5.2-5s5.2 2.1 5.2 5"/>
        <path d="M16.2 6.2a3 3 0 0 1 0 5.6"/>
        <path d="M17.4 14.4c1.8.7 2.8 2.4 2.8 4.6"/>
    </Icon>
);

export const GamesIcon = (props) => (
    <Icon {...props}>
        <path d="M9 7.6h6a4.8 4.8 0 0 1 4.72 3.94l.58 3.3a2.4 2.4 0 0 1-4.4 1.66l-.9-1.5H9l-.9 1.5a2.4 2.4 0 0 1-4.4-1.66l.58-3.3A4.8 4.8 0 0 1 9 7.6z"/>
        <path d="M7.6 10.7v2.4M6.4 11.9h2.4"/>
        <circle cx="15.5" cy="11.3" r="1" fill="currentColor" stroke="none"/>
        <circle cx="17.5" cy="13.3" r="1" fill="currentColor" stroke="none"/>
    </Icon>
);

export const SubscriptionIcon = (props) => (
    <Icon {...props}>
        <path d="M20.2 12a8.2 8.2 0 1 1-2.42-5.8"/>
        <path d="M20.2 3.8v4.4h-4.4"/>
    </Icon>
);

export const DonationIcon = (props) => (
    <Icon {...props}>
        <ellipse cx="12" cy="6.8" rx="7" ry="2.9"/>
        <path d="M5 6.8v10.4c0 1.6 3.13 2.9 7 2.9s7-1.3 7-2.9V6.8"/>
        <path d="M5 12c0 1.6 3.13 2.9 7 2.9s7-1.3 7-2.9"/>
    </Icon>
);

export const AddonsIcon = (props) => (
    <Icon {...props}>
        <path d="M8.4 4.6h9a3 3 0 0 1 3 3v9"/>
        <rect x="3.6" y="7.4" width="12" height="12" rx="3.4"/>
        <path d="M7.6 13.4h4M9.6 11.4v4"/>
    </Icon>
);
