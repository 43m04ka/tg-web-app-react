import React from 'react';
import {formatPrice} from '../Main/catalogSections';
import style from './Product.module.scss';

export default function ProductCheaper({regions, onSwitch}) {
    const current = regions?.find((item) => item.isCurrent) || null;
    const best = regions?.find((item) => item.isBest) || null;

    if (!current || !best || best.pageId === current.pageId) return null;
    if (current.price === null || best.price === null) return null;

    const cheaperBy = current.price - best.price;
    if (cheaperBy <= 0) return null;

    return (
        <button type="button" className={style.cheaper} onClick={() => onSwitch(best)}>
            {best.icon ? (
                <span
                    className={style.cheaperIcon}
                    style={{backgroundImage: `url(${best.icon})`}}
                    aria-hidden="true"
                />
            ) : null}
            <span className={style.cheaperText}>
                В регионе {best.label} дешевле на <b>{formatPrice(cheaperBy)}</b>
            </span>
            <span className={style.cheaperArrow} aria-hidden="true">›</span>
        </button>
    );
}
