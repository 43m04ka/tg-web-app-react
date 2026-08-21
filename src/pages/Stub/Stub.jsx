import React from 'react';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import style from './Stub.module.scss';

export default function Stub({title, text}) {
    const {contentSafeAreaInset} = useAppInsets();

    return (
        <div
            className={style.screen}
            style={{paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`}}
        >
            <div className={style.badge}>Раздел в разработке</div>
            <h1 className={style.title}>{title}</h1>
            <p className={style.text}>{text}</p>
        </div>
    );
}
