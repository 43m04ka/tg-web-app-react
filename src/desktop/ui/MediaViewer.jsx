import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useScrollArea} from '../shell/ScrollAreaContext';
import style from './MediaViewer.module.scss';

const SWIPE_PX = 50;

export default function MediaViewer({items, index, onIndex, onClose}) {
    const areaRef = useScrollArea();
    const stripRef = useRef(null);
    const touchRef = useRef(null);
    const [failed, setFailed] = useState(() => new Set());

    const isOpen = index !== null && index >= 0 && index < (items?.length ?? 0);
    const count = items?.length ?? 0;

    const go = useCallback((step) => {
        if (!isOpen || count < 2) return;
        onIndex((index + step + count) % count);
    }, [isOpen, count, index, onIndex]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'ArrowRight') go(1);
            if (event.key === 'ArrowLeft') go(-1);
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, go, onClose]);

    useEffect(() => {
        const node = areaRef?.current;
        if (!node || !isOpen) return undefined;

        const previous = node.style.overflowY;
        node.style.overflowY = 'hidden';

        return () => {
            node.style.overflowY = previous;
        };
    }, [areaRef, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        stripRef.current?.children[index]?.scrollIntoView({block: 'nearest', inline: 'center', behavior: 'smooth'});
    }, [isOpen, index]);

    if (!isOpen) return null;

    const item = items[index];

    const onTouchStart = (event) => {
        touchRef.current = event.touches[0].clientX;
    };

    const onTouchEnd = (event) => {
        if (touchRef.current === null) return;
        const delta = event.changedTouches[0].clientX - touchRef.current;
        touchRef.current = null;
        if (Math.abs(delta) > SWIPE_PX) go(delta < 0 ? 1 : -1);
    };

    return createPortal(
        <div className={style.overlay} role="dialog" aria-modal="true" onClick={onClose}>
            <div className={style.bar} onClick={(event) => event.stopPropagation()}>
                <span className={style.counter}>{index + 1} / {count}</span>
                <button type="button" className={style.close} onClick={onClose} aria-label="Закрыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m6 6 12 12M18 6 6 18"/>
                    </svg>
                </button>
            </div>

            <div className={style.stage} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                {count > 1 ? (
                    <button
                        type="button"
                        className={`${style.nav} ${style.navPrev}`}
                        onClick={(event) => {
                            event.stopPropagation();
                            go(-1);
                        }}
                        aria-label="Предыдущий"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>
                    </button>
                ) : null}

                {item.type === 'video' ? (
                    failed.has(item.url) ? (
                        <div className={style.fallback} onClick={(event) => event.stopPropagation()}>
                            <span>Не удалось проиграть трейлер здесь</span>
                            <a className={style.fallbackAction} href={item.url} target="_blank" rel="noopener noreferrer">
                                Открыть в новой вкладке
                            </a>
                        </div>
                    ) : (
                        <video
                            key={item.url}
                            className={style.media}
                            src={item.url}
                            poster={item.poster || undefined}
                            controls
                            autoPlay
                            playsInline
                            preload="auto"
                            onClick={(event) => event.stopPropagation()}
                            onError={() => setFailed((prev) => new Set(prev).add(item.url))}
                        />
                    )
                ) : (
                    <img
                        key={item.url}
                        className={style.media}
                        src={item.url}
                        alt=""
                        onClick={(event) => event.stopPropagation()}
                    />
                )}

                {count > 1 ? (
                    <button
                        type="button"
                        className={`${style.nav} ${style.navNext}`}
                        onClick={(event) => {
                            event.stopPropagation();
                            go(1);
                        }}
                        aria-label="Следующий"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>
                    </button>
                ) : null}
            </div>

            {count > 1 ? (
                <div className={style.strip} ref={stripRef} onClick={(event) => event.stopPropagation()}>
                    {items.map((entry, position) => (
                        <button
                            key={`${entry.type}:${entry.url}`}
                            type="button"
                            className={position === index ? `${style.thumb} ${style.thumbOn}` : style.thumb}
                            style={{backgroundImage: `url(${entry.type === 'video' ? entry.poster : entry.url})`}}
                            onClick={() => onIndex(position)}
                            aria-label={entry.type === 'video' ? 'Трейлер' : `Скриншот ${position + 1}`}
                        >
                            {entry.type === 'video' ? <PlayGlyph className={style.thumbPlay}/> : null}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>,
        document.body
    );
}

export function PlayGlyph({className}) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9.2 5.6 19.2 12 9.2 18.4Z"/>
        </svg>
    );
}
