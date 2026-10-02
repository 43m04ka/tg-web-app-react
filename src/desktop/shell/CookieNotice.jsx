import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import style from './CookieNotice.module.scss';

const STORAGE_KEY = 'cookie:accepted';

const isAccepted = () => {
    try {
        return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return false;
    }
};

export default function CookieNotice() {
    const [isShown, setShown] = useState(() => !isAccepted());

    if (!isShown) return null;

    const accept = () => {
        try {
            window.localStorage.setItem(STORAGE_KEY, '1');
        } catch {}

        setShown(false);
    };

    return (
        <aside className={style.notice} role="region" aria-label="Файлы cookie">
            <span className={style.icon} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-4.5-4A4 4 0 0 1 13.5 3.5 4 4 0 0 1 12 2zM8.5 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-1 6.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm5.5 1a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm3-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
            </span>

            <div className={style.body}>
                <p className={style.title}>Мы используем cookie</p>
                <p className={style.note}>
                    Только обязательные — чтобы сохранять корзину и вход в аккаунт.{' '}
                    <Link className={style.more} to="/info/cookie">Подробнее</Link>
                </p>
            </div>

            <button type="button" className={style.ok} onClick={accept}>Принять</button>
        </aside>
    );
}
