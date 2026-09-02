import React from 'react';
import style from './Layout.module.scss';

const classes = (...list) => list.filter(Boolean).join(' ');

export function Workspace({children}) {
    return <div className={style.workspace}>{children}</div>;
}

export function Panel({title = '', subtitle = '', actions = null, scroll = false, wide = false, children}) {
    return (
        <section className={classes(style.panel, wide && style.wide)}>
            {(title || actions) ? (
                <header className={style.head}>
                    <div className={style.heading}>
                        <span className={style.title}>{title}</span>
                        {subtitle ? <span className={style.subtitle}>{subtitle}</span> : null}
                    </div>
                    {actions ? <div className={style.actions}>{actions}</div> : null}
                </header>
            ) : null}
            <div className={classes(style.body, scroll && style.scroll)}>{children}</div>
        </section>
    );
}

export function Grid({columns = 2, children}) {
    return <div className={style.grid} style={{gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`}}>{children}</div>;
}
