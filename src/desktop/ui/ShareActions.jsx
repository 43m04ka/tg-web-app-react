import React, {useCallback, useEffect, useRef, useState} from 'react';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {copyText, shareProduct} from '../../shared/lib/shareProduct';
import {LinkIcon, ShareIcon} from '../shell/DesktopIcons';
import style from './ShareActions.module.scss';

const NOTICE_MS = 2200;

const SHARE_NOTICES = {
    sent: 'Карточка отправлена',
    copied: 'Скопировали текст карточки',
    failed: 'Не удалось поделиться'
};

export default function ShareActions({productId, text, link, className = ''}) {
    const {isTg} = usePlatform();

    const [notice, setNotice] = useState(null);
    const timerRef = useRef(0);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const flash = useCallback((message) => {
        clearTimeout(timerRef.current);
        setNotice(message);
        timerRef.current = setTimeout(() => setNotice(null), NOTICE_MS);
    }, []);

    const share = useCallback(async () => {
        const outcome = SHARE_NOTICES[await shareProduct({productId, text, link})];
        if (outcome) flash(outcome);
    }, [productId, text, link, flash]);

    const copy = useCallback(async () => {
        flash(await copyText(link) ? 'Ссылка скопирована' : 'Не удалось скопировать');
    }, [link, flash]);

    if (!link) return null;

    return (
        <div className={`${style.root} ${className}`}>
            {isTg ? (
                <button type="button" className={style.row} onClick={share}>
                    <span className={style.icon} aria-hidden="true"><ShareIcon/></span>
                    <span className={style.label}>Поделиться карточкой</span>
                    <span className={style.chevron} aria-hidden="true">›</span>
                </button>
            ) : null}

            <button type="button" className={style.row} onClick={copy}>
                <span className={style.icon} aria-hidden="true"><LinkIcon/></span>
                <span className={style.label}>Скопировать прямую ссылку</span>
                <span className={style.chevron} aria-hidden="true">›</span>
            </button>

            {notice ? <span className={style.notice} role="status">{notice}</span> : null}
        </div>
    );
}
