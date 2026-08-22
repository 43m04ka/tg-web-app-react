import React from 'react';
import style from './Broadcast.module.scss';

/** Скрепка (обводка), целиком вписана в viewBox 24×24 */
const BroadcastPaperclipIcon = () => (
    <svg
        className={style['clipIcon']}
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        focusable="false"
    >
        <path
            d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default BroadcastPaperclipIcon;
