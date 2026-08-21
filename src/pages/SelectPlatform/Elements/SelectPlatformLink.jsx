import React from 'react';
import style from './PlatformCard.module.scss';
import {getPlatformCardStyle} from './platformCardColors';

const SelectPlatformLink = ({
    item,
    isActive,
    animationDelay,
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
            onClick={() => { window.open(item.url) }}
        >
            <div className={style.cardBg} aria-hidden />
            <div className={style.cardGlow} aria-hidden />
            <div className={style.cardSheen} aria-hidden />


            <div className={style.cardBody}>
                <div className={style.linkImageWrap}>
                    <div
                        className={style.linkImage}
                        style={{ backgroundImage: `url(${item.icon})` }}
                    />
                </div>
                <div className={style.linkContent}>
                    <span className={style.cardTitleLink}>{item.text}</span>
                    <svg className={style.cardTitleLink} xmlns="http://www.w3.org/2000/svg" width="14"
                     height="14" viewBox="0 0 14 14" fill="none" stroke="none" style={{marginRight:'5cqi'}}>
                        <path d="M13 1L1 1M13 1L1 13M13 1V13" stroke="#cfcfcf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>

            {/* {isActive ? <span className={style.cardBadge}>Текущая</span> : null} */}
        </div>
    );
};

export default SelectPlatformLink;
