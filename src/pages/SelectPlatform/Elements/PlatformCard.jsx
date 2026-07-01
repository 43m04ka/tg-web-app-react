import React from 'react';
import style from './PlatformCard.module.scss';
import {getPlatformCardStyle} from './platformCardColors';

const PlatformCard = ({
    item,
    isActive,
    animationDelay = '0s',
    onSelect,
}) => {
    const accentColor = item.color || '#5B78E3';

    return (
        <div
            role="presentation"
            className={`${style.card} ${isActive ? style.cardActive : ''}`}
            style={{
                ...getPlatformCardStyle(accentColor),
                animationDelay,
            }}
            onClick={onSelect}
        >
            <div className={style.cardBg} aria-hidden />
            <div className={style.cardGlow} aria-hidden />
            <div className={style.cardSheen} aria-hidden />

            <div className={style.pattern}>
                <div style={{backgroundImage: `url(${item.pattern})`}}/>
                <div style={{backgroundImage: `url(${item.pattern})`}}/>
            </div>

            <div className={style.cardBody}>
                <div className={style.cardImageWrap}>
                    <div
                        className={style.cardImage}
                        style={{backgroundImage: `url(${item.icon})`}}
                    />
                </div>
                <div className={style.cardContent}>
                    <span className={style.cardTitle}>{item.name}</span>
                    <span className={style.cardSubtitle}>
                        {item.text}
                    </span>
                </div>
            </div>

            {/* {isActive ? <span className={style.cardBadge}>Текущая</span> : null} */}
        </div>
    );
};

export default PlatformCard;
