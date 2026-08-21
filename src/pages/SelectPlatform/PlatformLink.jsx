import React from 'react';
import {accentStyle} from './accent';
import style from './SelectPlatform.module.scss';

export default function PlatformLink({item}) {
    return (
        <a
            className={style.link}
            style={accentStyle(item.color)}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
        >
            <span className={style.sheen} aria-hidden="true"/>
            <span className={style.linkIcon} style={item.icon ? {backgroundImage: `url(${item.icon})`} : undefined}/>
            <span className={style.linkText}>{item.text}</span>
            <span className={style.linkArrow} aria-hidden="true">↗</span>
        </a>
    );
}
