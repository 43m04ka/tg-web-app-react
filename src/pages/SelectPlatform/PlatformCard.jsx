import React from 'react';
import {accentStyle} from './accent';
import style from './SelectPlatform.module.scss';

export default function PlatformCard({item, isActive, delay = 0, onSelect}) {
    return (
        <button
            type="button"
            className={`${style.card} ${isActive ? style.cardActive : ''}`}
            style={{...accentStyle(item.color), animationDelay: `${delay}ms`}}
            onClick={onSelect}
        >
            {item.pattern ? (
                <span className={style.pattern} style={{backgroundImage: `url(${item.pattern})`}} aria-hidden="true"/>
            ) : null}

            <span className={style.cardIcon} style={item.icon ? {backgroundImage: `url(${item.icon})`} : undefined}/>

            <span className={style.cardBody}>
                <span className={style.cardTitle}>{item.title}</span>
                {item.text ? <span className={style.cardSubtitle}>{item.text}</span> : null}
            </span>

            <span className={`${style.tick} ${isActive ? style.tickActive : ''}`} aria-hidden="true">
                {isActive ? '✓' : ''}
            </span>
        </button>
    );
}
