import React from 'react';
import style from './SelectPlatform.module.scss';

export default function SectionHeader({item}) {
    if (item.type !== 'title') {
        return <p className={style.hint}>{item.text}</p>;
    }

    return (
        <div className={style.sectionHeader}>
            <span
                className={style.sectionBadge}
                style={item.icon ? {backgroundImage: `url(${item.icon})`} : undefined}
                aria-hidden="true"
            />
            <span className={style.sectionTitle}>{item.text}</span>
        </div>
    );
}
