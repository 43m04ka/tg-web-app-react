import React, {useCallback, useEffect, useRef, useState} from 'react';
import {hapticImpact} from '../../shared/lib/haptic';
import {copyText, shareProduct} from '../../shared/lib/shareProduct';
import style from './Product.module.scss';

const NOTICE_MS = 2000;

const SHARE_NOTICES = {
    sent: 'Карточка отправлена',
    copied: 'Скопировали текст карточки',
    failed: 'Не удалось поделиться'
};

export default function ProductShare({productId, userId, text, link}) {
    const [notice, setNotice] = useState(null);
    const timerRef = useRef(0);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const flash = useCallback((message) => {
        clearTimeout(timerRef.current);
        setNotice(message);
        timerRef.current = setTimeout(() => setNotice(null), NOTICE_MS);
    }, []);

    const share = useCallback(async () => {
        hapticImpact('light');
        const notice = SHARE_NOTICES[await shareProduct({productId, userId, text, link})];
        if (notice) flash(notice);
    }, [productId, userId, text, link, flash]);

    const copy = useCallback(async () => {
        hapticImpact('light');
        flash(await copyText(link) ? 'Ссылка скопирована' : 'Не удалось скопировать');
    }, [link, flash]);

    return (
        <div className={style.share}>
            <button type="button" className={style.shareRow} onClick={share}>
                <span className={style.shareIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 15V4m0 0L8.2 7.8M12 4l3.8 3.8" stroke="currentColor" strokeWidth="1.9"
                              strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5 13.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4.5" stroke="currentColor"
                              strokeWidth="1.9" strokeLinecap="round"/>
                    </svg>
                </span>
                <span className={style.shareLabel}>Поделиться карточкой</span>
                <span className={style.shareChevron} aria-hidden="true">›</span>
            </button>

            <button type="button" className={style.shareRow} onClick={copy}>
                <span className={style.shareIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                        <rect x="9" y="9" width="11" height="11" rx="3" stroke="currentColor" strokeWidth="1.9"/>
                        <path d="M15 6.5A2.5 2.5 0 0 0 12.5 4H7a3 3 0 0 0-3 3v5.5A2.5 2.5 0 0 0 6.5 15"
                              stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
                    </svg>
                </span>
                <span className={style.shareLabel}>Скопировать прямую ссылку</span>
                <span className={style.shareChevron} aria-hidden="true">›</span>
            </button>

            {notice ? <div className={style.notice}>{notice}</div> : null}
        </div>
    );
}
