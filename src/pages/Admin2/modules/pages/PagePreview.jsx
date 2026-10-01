import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import TextPageView from '../../../TextPages/TextPageView';
import siteStyle from '../../../TextPages/TextPages.module.scss';
import {toPayload} from './pagesModel';
import style from './PagesScreen.module.scss';

const DESKTOP_WIDTH = 1100;

const MODES = [
    {value: 'desktop', title: 'ПК'},
    {value: 'phone', title: 'Телефон'}
];

export default function PagePreview({draft, updatedAt}) {
    const [mode, setMode] = useState('desktop');
    const [zoom, setZoom] = useState(1);
    const frameRef = useRef(null);

    const page = useMemo(() => {
        const payload = toPayload(draft);

        return {...payload, title: payload.title || 'Заголовок страницы', updatedAt: updatedAt || new Date().toISOString()};
    }, [draft, updatedAt]);

    useEffect(() => {
        const node = frameRef.current;
        if (!node || typeof ResizeObserver === 'undefined') return undefined;

        const observer = new ResizeObserver(([entry]) => {
            setZoom(Math.min(1, entry.contentRect.width / DESKTOP_WIDTH));
        });

        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    const keepInside = useCallback((event) => {
        const link = event.target.closest('a');
        if (!link || String(link.getAttribute('href') || '').startsWith('#')) return;

        event.preventDefault();
        event.stopPropagation();
    }, []);

    return (
        <aside className={style.preview}>
            <div className={style.previewHead}>
                <span className={style.previewTitle}>Предпросмотр</span>

                <div className={style.previewModes} role="radiogroup">
                    {MODES.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            role="radio"
                            aria-checked={mode === item.value}
                            className={mode === item.value ? style.previewModeOn : style.previewMode}
                            onClick={() => setMode(item.value)}
                        >
                            {item.title}
                        </button>
                    ))}
                </div>
            </div>

            <div className={style.previewFrame} ref={frameRef} onClickCapture={keepInside}>
                {mode === 'desktop' ? (
                    <div className={style.previewDesktop} style={{zoom}}>
                        <div className={`${siteStyle.desktop} ${style.previewPage}`}>
                            <div className={siteStyle.sheet}>
                                <TextPageView page={page}/>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={style.previewPhone}>
                        <div className={`${siteStyle.mobile} ${style.previewPage}`}>
                            <TextPageView page={page}/>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
