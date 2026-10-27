import React, {useCallback, useEffect, useRef, useState} from 'react';
import {hapticImpact} from '../../lib/haptic';
import style from './OrderCodes.module.scss';

const copyText = async (text) => {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {}

    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let done = false;
    try {
        done = document.execCommand('copy');
    } catch {}
    document.body.removeChild(area);
    return done;
};

export default function OrderCodes({codes, className = '', compact = false}) {
    const [copied, setCopied] = useState(-1);
    const timerRef = useRef(0);

    useEffect(() => () => window.clearTimeout(timerRef.current), []);

    const copy = useCallback(async (code, index) => {
        if (!(await copyText(code))) return;
        hapticImpact('light');
        setCopied(index);
        window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setCopied(-1), 1800);
    }, []);

    if (!Array.isArray(codes) || codes.length === 0) return null;

    return (
        <div className={`${style.box} ${compact ? style.compact : ''} ${className}`}>
            <span className={style.title}>{codes.length > 1 ? 'Ваши коды' : 'Ваш код'}</span>
            <ul className={style.list}>
                {codes.map((code, index) => (
                    <li key={`${code}-${index}`} className={style.item}>
                        {codes.length > 1 ? <span className={style.index}>{index + 1}</span> : null}
                        <code className={style.code}>{code}</code>
                        <button type="button" className={style.copy} onClick={() => copy(code, index)}>
                            {copied === index ? 'Скопирован' : 'Копировать'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
