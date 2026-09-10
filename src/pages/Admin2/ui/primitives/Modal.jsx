import React, {useEffect} from 'react';
import {IconButton} from './Button';
import style from './Modal.module.scss';

const classes = (...list) => list.filter(Boolean).join(' ');

export function Modal({title, subtitle = '', size = 'm', onClose, footer = null, children}) {
    useEffect(() => {
        const onKey = (event) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className={style.backdrop} data-a2-modal onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <div className={classes(style.window, style[size])} role="dialog" aria-modal="true">
                <header className={style.head}>
                    <div className={style.heading}>
                        <h2 className={style.title}>{title}</h2>
                        {subtitle ? <span className={style.subtitle}>{subtitle}</span> : null}
                    </div>
                    <IconButton label="Закрыть" onClick={onClose}>×</IconButton>
                </header>

                <div className={style.body}>{children}</div>

                {footer ? <footer className={style.footer}>{footer}</footer> : null}
            </div>
        </div>
    );
}
