import React from 'react';
import mark from '../assets/logo-render.webp';
import poster from '../assets/logo-render-poster.jpg';
import style from './BrandLogo.module.scss';

export default function BrandLogo({className = '', large = false}) {
    return <span className={`${style.brand} ${large ? style.large : ''} ${className}`} role="img" aria-label="Геймворд">
        <picture className={style.mark} aria-hidden="true">
            <source media="(prefers-reduced-motion: reduce)" srcSet={poster}/>
            <img src={mark} width="160" height="160" alt=""/>
        </picture>
        <span className={style.wordmark} aria-hidden="true"><strong>ГЕЙМВОРД</strong>
            <span>{Array.from('ИГРОВОЙ ДИСКАУНТЕР').map((letter, index) => <span key={index}>{letter === ' ' ? '\u00a0' : letter}</span>)}</span>
        </span>
    </span>;
}
