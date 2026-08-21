import React from 'react';
import {accentStyle} from './accent';
import CardPattern from './CardPattern';
import style from './SelectPlatform.module.scss';

export default function PlatformCard({item, isActive, onSelect}) {
    return (
        <button
            type="button"
            className={`${style.card} ${isActive ? style.cardActive : ''}`}
            style={accentStyle(item.color)}
            onClick={onSelect}
            aria-pressed={isActive}
        >
            <span className={style.sheen} aria-hidden="true"/>
            <CardPattern src={item.pattern}/>

            <span className={style.cardIcon} style={item.icon ? {backgroundImage: `url(${item.icon})`} : undefined}/>

            <span className={style.cardBody}>
                <span className={style.cardTitle}>{item.title}</span>
                {item.text ? <span className={style.cardSubtitle}>{item.text}</span> : null}
            </span>

            <span className={`${style.tick} ${isActive ? style.tickActive : ''}`} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                    <path
                        d="M5 12.5L10 17.5L19 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
        </button>
    );
}
