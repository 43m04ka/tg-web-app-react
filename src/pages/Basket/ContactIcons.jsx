import React from 'react';

export function TelegramIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path
                d="M20.6 4.4 3.9 10.8c-.9.35-.88 1.63.03 1.95l4.1 1.44 1.6 4.9c.26.8 1.29.99 1.82.33l2.2-2.75 4.15 3.05c.63.46 1.53.12 1.7-.65l2.6-12.5c.19-.9-.68-1.62-1.5-1.17Z"
                fill="currentColor"
            />
            <path d="m8.03 14.19 9.1-6.3-6.6 7.35" stroke="var(--bg-elevated)" strokeWidth="1.1" strokeLinejoin="round"/>
        </svg>
    );
}

export function VkIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path
                d="M12.7 17.2c-5.05 0-8.2-3.55-8.32-9.45h2.55c.08 4.34 2.06 6.2 3.57 6.58V7.75h2.42v3.62c1.46-.16 2.98-1.87 3.5-3.62h2.38c-.4 2.15-2.05 3.86-3.22 4.56 1.17.57 3.05 2.06 3.77 4.89h-2.62c-.56-1.78-1.95-3.16-3.81-3.35v3.35h-.22Z"
                fill="currentColor"
            />
        </svg>
    );
}

export function MailIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <rect x="3" y="5.5" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.7"/>
            <path d="m4.6 8.4 6.3 4.3c.67.46 1.53.46 2.2 0l6.3-4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
    );
}

export function PhoneIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path
                d="M8.2 4.3c.5-.35 1.2-.2 1.5.33l1.35 2.4c.26.47.16 1.06-.25 1.4l-1.1.92a10.4 10.4 0 0 0 4.95 4.95l.92-1.1c.34-.41.93-.51 1.4-.25l2.4 1.35c.53.3.68 1 .33 1.5l-1.05 1.5a2.6 2.6 0 0 1-2.9.98C11.6 16.9 7.1 12.4 5.72 7.25a2.6 2.6 0 0 1 .98-2.9l1.5-1.05Z"
                fill="currentColor"
            />
        </svg>
    );
}

export const CHANNEL_ICONS = {
    telegram: TelegramIcon,
    vk: VkIcon,
    email: MailIcon,
    phone: PhoneIcon
};
