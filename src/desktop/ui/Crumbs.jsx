import React from 'react';
import style from './Crumbs.module.scss';

export default function Crumbs({trail, className}) {
    if (!trail || trail.length < 2) return null;

    return (
        <nav className={className ? `${style.crumbs} ${className}` : style.crumbs} aria-label="Навигация">
            {trail.map((item, index) => (
                <React.Fragment key={item.key}>
                    {index > 0 ? <span className={style.divider} aria-hidden="true">/</span> : null}

                    {item.onClick ? (
                        <button type="button" className={style.link} onClick={item.onClick}>
                            {index === 0 ? <HomeGlyph/> : null}
                            {item.label}
                        </button>
                    ) : (
                        <span className={style.current} aria-current="page">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}

function HomeGlyph() {
    return (
        <svg className={style.home} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1z"/>
        </svg>
    );
}
