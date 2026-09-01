import React from 'react';
import style from './Button.module.scss';

const classes = (...list) => list.filter(Boolean).join(' ');

export function Button({
    variant = 'secondary',
    size = 'm',
    loading = false,
    disabled = false,
    block = false,
    icon = null,
    children,
    className = '',
    ...rest
}) {
    return (
        <button
            type="button"
            className={classes(style.button, style[variant], style[size], block && style.block, loading && style.loading, className)}
            disabled={disabled || loading}
            {...rest}
        >
            {loading ? <span className={style.spinner}/> : icon}
            {children ? <span className={style.label}>{children}</span> : null}
        </button>
    );
}

export function IconButton({label, active = false, className = '', children, ...rest}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={classes(style.icon, active && style.iconActive, className)}
            {...rest}
        >
            {children}
        </button>
    );
}

export function ButtonRow({children, align = 'start'}) {
    return <div className={classes(style.row, style[`align_${align}`])}>{children}</div>;
}
