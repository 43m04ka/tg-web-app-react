import React from 'react';
import style from './EmptyState.module.scss';

// Один вид пустого экрана на всё приложение: круглая плашка со знаком, заголовок,
// пояснение и одно действие. Раньше каждый экран писал свою серую строку —
// пустое избранное и упавший запрос выглядели одинаково и одинаково уныло.
export default function EmptyState({icon, title, text, actionLabel, onAction, tone = 'muted'}) {
    return (
        <div className={style.empty}>
            <span className={`${style.badge} ${style[tone]}`} aria-hidden="true">{icon}</span>

            <span className={style.title}>{title}</span>
            {text ? <span className={style.text}>{text}</span> : null}

            {actionLabel && onAction ? (
                <button type="button" className={style.action} onClick={onAction}>{actionLabel}</button>
            ) : null}
        </div>
    );
}
