import React from 'react';
import {FlagIcon} from '../../shell/DesktopIcons';
import style from './Storefront.module.scss';

const FLAGS = {ps: 'tr', ps_india: 'in'};

export default function OriginMark({origin, className}) {
    if (!origin) return null;

    const flag = FLAGS[origin.type];
    if (!origin.icon && !flag) return <span className={className}>{origin.label}</span>;

    return (
        <span className={`${className} ${style.originMark}`} title={origin.label} aria-label={origin.label}>
            {origin.icon ? (
                <span className={style.originIcon} style={{backgroundImage: `url(${origin.icon})`}} aria-hidden="true"/>
            ) : null}
            {flag ? <FlagIcon className={style.originFlag} code={flag} aria-hidden="true"/> : null}
        </span>
    );
}
