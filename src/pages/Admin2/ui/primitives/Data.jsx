import React from 'react';
import style from './Data.module.scss';

const classes = (...list) => list.filter(Boolean).join(' ');

const moneyFormat = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 2});

export function Money({value, currency = '₽', tone = 'default'}) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return <span className={style.empty}>—</span>;
    }

    return (
        <span className={classes(style.money, style[tone])}>
            {moneyFormat.format(Number(value))}
            <span className={style.currency}>{currency}</span>
        </span>
    );
}

export function Mono({children, muted = false}) {
    return <span className={classes(style.mono, muted && style.monoMuted)}>{children}</span>;
}

export function Stat({label, value, note = '', tone = 'default'}) {
    return (
        <div className={style.stat}>
            <span className={style.statLabel}>{label}</span>
            <span className={classes(style.statValue, style[tone])}>{value}</span>
            {note ? <span className={style.statNote}>{note}</span> : null}
        </div>
    );
}

export function StatRow({children}) {
    return <div className={style.statRow}>{children}</div>;
}

export function Time({value}) {
    if (!value) return <span className={style.empty}>—</span>;

    const date = new Date(value);
    const text = date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });

    return <span className={style.time}>{text}</span>;
}
