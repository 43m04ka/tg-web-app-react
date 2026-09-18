import React from 'react';
import style from './Spinner.module.scss';

export default function Spinner({className = ''}) {
    return <span className={`${style.spinner} ${className}`} aria-hidden="true"/>;
}
