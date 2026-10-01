import React from 'react';
import {LOGO_PATH, LOGO_VIEW_BOX} from '../assets/logoPath';
import style from './LogoDrum.module.scss';

const COLORS = ['#ffffff', '#69ce6e', '#2474d7'];

export default function LogoDrum({className = ''}) {
    return (
        <span className={`${style.drum} ${className}`} role="img" aria-label="Геймворд">
            {COLORS.map((color) => (
                <svg key={color} className={style.face} viewBox={LOGO_VIEW_BOX} aria-hidden="true" style={{color}}>
                    <path fill="currentColor" fillRule="evenodd" d={LOGO_PATH}/>
                </svg>
            ))}
        </span>
    );
}
