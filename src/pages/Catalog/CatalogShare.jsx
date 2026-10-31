import React, {useEffect, useRef, useState} from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {copyText} from '../../shared/lib/shareProduct';
import style from './CatalogShare.module.scss';

export default function CatalogShare({path, desktop = false}) {
    const {isTg, isVk} = usePlatform();
    const [status, setStatus] = useState('idle');
    const timer = useRef(0);
    const pending = useRef(false);

    useEffect(() => () => clearTimeout(timer.current), []);

    const copy = async () => {
        if (pending.current) return;
        pending.current = true;
        clearTimeout(timer.current);
        setStatus('copying');

        const link = new URL('/', window.location.origin);
        link.searchParams.set('startapp', `catalog_${path}`);
        let copied = false;

        if (isVk && vkBridge.supports('VKWebAppCopyText')) {
            try {
                const result = await vkBridge.send('VKWebAppCopyText', {text: link.href});
                copied = result.result === true;
            } catch (error) {
                copied = false;
            }
        }

        if (!copied) copied = await copyText(link.href);

        pending.current = false;
        setStatus(copied ? 'copied' : 'failed');
        timer.current = setTimeout(() => setStatus('idle'), 2000);
    };

    if (isTg) return null;

    return (
        <div className={style.root}>
            <button
                type="button"
                className={`${style.button} ${desktop ? style.desktop : ''} ${status === 'copied' ? style.copied : ''} ${status === 'failed' ? style.failed : ''}`}
                aria-label="Поделиться каталогом"
                title="Поделиться каталогом"
                disabled={status === 'copying'}
                onClick={copy}
            >
                <svg key={status === 'copied' ? 'check' : 'share'} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    {status === 'copied' ? (
                        <path className={style.check} d="m5 12 4 4L19 6"/>
                    ) : (
                        <>
                            <path d="M12 15V4m0 0L8 8m4-4 4 4"/>
                            <path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>
                        </>
                    )}
                </svg>
                <span className={style.labels} aria-hidden="true">
                    <span className={style.defaultLabel}>Поделиться</span>
                    <span className={style.resultLabel}>{status === 'failed' ? 'Не скопировано' : 'Скопировано'}</span>
                </span>
            </button>
            <span className={style.announcement} role="status" aria-live="polite">
                {status === 'copied' ? <span key="copied">Скопировано</span> : null}
                {status === 'failed' ? <span key="failed">Не удалось скопировать</span> : null}
            </span>
        </div>
    );
}
