import React from 'react';
import style from './Splash.module.scss';

export default function Splash({label = 'Геймворд'}) {
    return (
        <div className={style.splash} role="status" aria-live="polite">
            <div className={style.pulse} aria-hidden="true">
                <span/>
                <span/>
                <span/>
            </div>
            <div className={style.label}>{label}</div>
        </div>
    );
}
