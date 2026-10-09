import React from 'react';

export const SearchIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <circle cx="10.6" cy="10.6" r="6.7" stroke="currentColor" strokeWidth="2"/>
        <path d="m15.6 15.6 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

export const BasketIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="9.6" cy="19.6" r="1.2"/>
        <circle cx="17.6" cy="19.6" r="1.2"/>
        <path d="M2 3h2.1c.5 0 .9.3 1 .8l2.5 10.7a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 7.5H5.9"/>
    </svg>
);

export const UserIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <circle cx="12" cy="8.1" r="3.9" stroke="currentColor" strokeWidth="1.9"/>
        <path d="M4.6 19.9c.9-3.6 3.8-5.6 7.4-5.6s6.5 2 7.4 5.6"
              stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
    </svg>
);

export const ChevronIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="m6 9.5 6 6 6-6" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const BurgerIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
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
            d="M12 19.7c-.4 0-.8-.14-1.1-.4C7 16.1 3.4 13 3.4 9.4A4.7 4.7 0 0 1 12 6.7a4.7 4.7 0 0 1 8.6 2.7c0 3.6-3.6 6.7-7.5 9.9-.3.26-.7.4-1.1.4Z"
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

const MENU_PATHS = {
    gamepad: (
        <>
            <path d="M7.2 7h9.6a4.2 4.2 0 0 1 4.1 3.4l.9 4.8a2.6 2.6 0 0 1-4.5 2.2L15.6 16H8.4l-1.7 1.4a2.6 2.6 0 0 1-4.5-2.2l.9-4.8A4.2 4.2 0 0 1 7.2 7Z"
                  stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M8 10v3M6.5 11.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="15.6" cy="10.6" r="1" fill="currentColor"/>
            <circle cx="17.4" cy="12.6" r="1" fill="currentColor"/>
        </>
    ),
    plus: (
        <>
            <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </>
    ),
    xbox: (
        <>
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M7.6 6.8c2.6 1.9 5.6 5.6 7.6 10.3M16.4 6.8c-2.6 1.9-5.6 5.6-7.6 10.3"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </>
    ),
    ticket: (
        <>
            <path d="M3.5 8a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v1.6a2.4 2.4 0 0 0 0 4.8V16a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-1.6a2.4 2.4 0 0 0 0-4.8V8Z"
                  stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M14.5 6.5v11" stroke="currentColor" strokeWidth="1.8" strokeDasharray="1.6 2"/>
        </>
    ),
    wallet: (
        <>
            <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17v3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <rect x="4" y="8" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
            <circle cx="16" cy="13.5" r="1.2" fill="currentColor"/>
        </>
    ),
    card: (
        <>
            <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M3.5 10h17M7 14.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </>
    ),
    box: (
        <>
            <path d="m12 3.5 8 4v9l-8 4-8-4v-9l8-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="m4 7.5 8 4 8-4M12 11.5v9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        </>
    ),
    book: (
        <>
            <path d="M5 5.5A2 2 0 0 1 7 3.5h12v14H7a2 2 0 0 0-2 2v-14Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M5 19.5a2 2 0 0 0 2 1h12v-3M9 8h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </>
    ),
    doc: (
        <>
            <path d="M7 3.5h7l4.5 4.5v10.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M13.5 3.5V8h5M8.5 12.5h7M8.5 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </>
    ),
    chat: (
        <path d="M12 4c4.7 0 8.5 3.2 8.5 7.2s-3.8 7.2-8.5 7.2c-1 0-2-.1-2.9-.4L4.5 20l1.2-3.7C4.3 15 3.5 13.2 3.5 11.2 3.5 7.2 7.3 4 12 4Z"
              stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    )
};

export const MenuIcon = ({name, ...props}) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        {MENU_PATHS[name] || MENU_PATHS.gamepad}
    </svg>
);

const FLAGS = {
    tr: (
        <>
            <rect width="30" height="20" fill="#e30a17"/>
            <circle cx="11.2" cy="10" r="5" fill="#fff"/>
            <circle cx="12.45" cy="10" r="4" fill="#e30a17"/>
            <polygon fill="#fff" points="14.00,10.00 15.75,9.38 15.80,7.53 16.92,9.00 18.70,8.47 17.65,10.00 18.70,11.53 16.92,11.00 15.80,12.47 15.75,10.62"/>
        </>
    ),
    in: (
        <>
            <rect width="30" height="20" fill="#fff"/>
            <rect width="30" height="6.67" fill="#ff9933"/>
            <rect y="13.33" width="30" height="6.67" fill="#138808"/>
            <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" strokeWidth="0.6"/>
            <circle cx="15" cy="10" r="0.6" fill="#000080"/>
        </>
    )
};

export const FlagIcon = ({code, ...props}) => (
    <svg viewBox="0 0 30 20" {...props}>{FLAGS[code]}</svg>
);
