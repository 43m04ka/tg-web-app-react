import React from 'react';
import mark from '../assets/logo.png';
import style from './BrandLogo.module.scss';

export default function BrandLogo({className = '', large = false}) {
    return <span className={`${style.brand} ${large ? style.large : ''} ${className}`} role="img" aria-label="Геймворд">
        <span className={style.mark} style={{'--brand-mark': `url(${mark})`}} aria-hidden="true"><img src={mark} alt=""/></span>
        <span className={style.wordmark} aria-hidden="true"><strong>ГЕЙМВОРД</strong><span>Игровой дискаунтер</span></span>
    </span>;
}
