import React, {useCallback, useEffect, useRef, useState} from 'react';
import {PREVIEW_MESSAGE, PREVIEW_READY, PREVIEW_URL} from '../../../../shared/lib/desktopPreview';
import style from './DesktopScreen.module.scss';

const FRAME_WIDTH = 1440;

export default function DesktopPreview({shelves, banners}) {
    const boxRef = useRef(null);
    const frameRef = useRef(null);

    const [box, setBox] = useState({width: 0, height: 0});
    const [isReady, setReady] = useState(false);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        const node = boxRef.current;
        if (!node || typeof ResizeObserver === 'undefined') return undefined;

        const observer = new ResizeObserver(([entry]) => {
            setBox({width: entry.contentRect.width, height: entry.contentRect.height});
        });

        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const onMessage = (event) => {
            if (event.origin !== window.location.origin || event.data?.type !== PREVIEW_READY) return;
            if (event.source !== frameRef.current?.contentWindow) return;
            setReady(true);
        };

        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, []);

    useEffect(() => {
        if (!isReady) return;

        frameRef.current?.contentWindow?.postMessage(
            {type: PREVIEW_MESSAGE, desktopShelves: shelves, banners},
            window.location.origin
        );
    }, [isReady, shelves, banners]);

    const reload = useCallback(() => {
        setReady(false);
        setVersion((value) => value + 1);
    }, []);

    const scale = box.width ? box.width / FRAME_WIDTH : 0;

    return (
        <aside className={style.preview}>
            <div className={style.previewHead}>
                <span className={style.previewTitle}>Как увидит покупатель на ПК</span>

                <span className={style.previewTools}>
                    <button type="button" className={style.previewButton} onClick={reload}>Обновить</button>
                    <a className={style.previewButton} href={PREVIEW_URL} target="_blank" rel="noreferrer">Открыть</a>
                </span>
            </div>

            <div className={style.previewBox} ref={boxRef}>
                {scale ? (
                    <iframe
                        key={version}
                        ref={frameRef}
                        title="Главная ПК"
                        src={PREVIEW_URL}
                        className={style.previewFrame}
                        style={{width: FRAME_WIDTH, height: box.height / scale, transform: `scale(${scale})`}}
                    />
                ) : null}
            </div>
        </aside>
    );
}
