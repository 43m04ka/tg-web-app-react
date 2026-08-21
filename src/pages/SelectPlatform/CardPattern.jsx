import React from 'react';
import style from './SelectPlatform.module.scss';

export default function CardPattern({src}) {
    if (!src) return null;

    return (
        <span className={style.pattern} aria-hidden="true">
            <span style={{backgroundImage: `url(${src})`}}/>
            <span style={{backgroundImage: `url(${src})`}}/>
        </span>
    );
}
