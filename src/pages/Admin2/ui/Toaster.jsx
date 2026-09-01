import React, {useEffect, useState} from 'react';
import {dismissToast, subscribeToasts} from '../platform/notify';
import style from './Toaster.module.scss';

const classes = (...list) => list.filter(Boolean).join(' ');

export default function Toaster() {
    const [items, setItems] = useState([]);

    useEffect(() => subscribeToasts(setItems), []);

    if (!items.length) return null;

    return (
        <div className={style.stack}>
            {items.map((item) => (
                <div key={item.id} className={classes(style.toast, style[item.tone])}>
                    <div className={style.body}>
                        <span className={style.title}>{item.title}</span>
                        {item.text ? <span className={style.text}>{item.text}</span> : null}
                    </div>
                    <button type="button" className={style.close} onClick={() => dismissToast(item.id)} aria-label="Закрыть">×</button>
                </div>
            ))}
        </div>
    );
}
