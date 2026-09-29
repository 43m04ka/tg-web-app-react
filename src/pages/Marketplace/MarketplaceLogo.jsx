import React from 'react';

export default function MarketplaceLogo({logo, className}) {
    if (logo) return <img className={className} src={logo} alt="" aria-hidden="true"/>;

    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect width="24" height="24" rx="6" fill="currentColor" opacity="0.18"/>
            <circle cx="7" cy="12" r="1.8" fill="currentColor"/>
            <circle cx="12" cy="12" r="1.8" fill="currentColor"/>
            <circle cx="17" cy="12" r="1.8" fill="currentColor"/>
        </svg>
    );
}
