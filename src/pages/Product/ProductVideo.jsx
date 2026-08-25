import React, {useEffect, useState} from 'react';
import style from './Product.module.scss';

export default function ProductVideo({url, onClose, onFallback}) {
    const [isFailed, setIsFailed] = useState(false);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    return (
        <div className={style.viewer} role="dialog" aria-modal="true" onClick={onClose}>
            <div className={style.viewerBar}>
                <button type="button" className={style.viewerClose} onClick={onClose} aria-label="Закрыть">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                    </svg>
                </button>
            </div>

            {isFailed ? (
                <div className={style.viewerFallback}>
                    <span className={style.viewerFallbackText}>Не удалось проиграть трейлер здесь</span>
                    <button type="button" className={style.viewerFallbackAction} onClick={onFallback}>
                        Открыть в браузере
                    </button>
                </div>
            ) : (
                <video
                    className={style.viewerVideo}
                    src={url}
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    onClick={(event) => event.stopPropagation()}
                    onError={() => setIsFailed(true)}
                />
            )}
        </div>
    );
}
