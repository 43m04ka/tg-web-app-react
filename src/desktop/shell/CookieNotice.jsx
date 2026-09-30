import React, {useEffect, useState} from 'react';
import style from './CookieNotice.module.scss';

const HIDE_AFTER_MS = 5000;

export default function CookieNotice() {
    const [isShown, setShown] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShown(false), HIDE_AFTER_MS);
        return () => clearTimeout(timer);
    }, []);

    if (!isShown) return null;

    return (
        <aside className={style.notice} role="status">
            <span className={style.icon} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-4.5-4A4 4 0 0 1 13.5 3.5 4 4 0 0 1 12 2zM8.5 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-1 6.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm5.5 1a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm3-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
            </span>

            <div className={style.text}>
                <strong className={style.title}>Cookies</strong>
                <p className={style.note}>Наш сайт не использует Cookies файлы.</p>
            </div>

            <button type="button" className={style.ok} onClick={() => setShown(false)}>Ок</button>
        </aside>
    );
}
