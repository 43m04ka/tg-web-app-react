import React from 'react';
import style from './Tabs.module.scss';

const classes = (...list) => list.filter(Boolean).join(' ');

export function Tabs({items = [], value, onChange}) {
    return (
        <div className={style.tabs} role="tablist">
            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={item.id === value}
                    className={classes(style.tab, item.id === value && style.active)}
                    onClick={() => onChange(item.id)}
                >
                    {item.title}
                    {item.count === undefined ? null : <span className={style.count}>{item.count}</span>}
                </button>
            ))}
        </div>
    );
}
