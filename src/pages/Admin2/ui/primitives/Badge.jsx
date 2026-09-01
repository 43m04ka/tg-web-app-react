import React from 'react';
import style from './Badge.module.scss';

const classes = (...list) => list.filter(Boolean).join(' ');

export function Badge({tone = 'neutral', children, className = ''}) {
    return <span className={classes(style.badge, style[tone], className)}>{children}</span>;
}

export function Dot({tone = 'neutral'}) {
    return <i className={classes(style.dot, style[tone])}/>;
}

export function Chip({active = false, onClick, onRemove, children}) {
    return (
        <span className={classes(style.chip, active && style.chipActive)}>
            <button type="button" className={style.chipBody} onClick={onClick}>{children}</button>
            {onRemove ? (
                <button type="button" className={style.chipRemove} onClick={onRemove} aria-label="Убрать">×</button>
            ) : null}
        </span>
    );
}

export function Count({value, tone = 'neutral'}) {
    return <span className={classes(style.count, style[tone])}>{value}</span>;
}
