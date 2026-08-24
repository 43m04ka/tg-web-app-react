import React from 'react';
import style from './Product.module.scss';

export default function ProductOffer({offer, route, onOpen}) {
    if (!offer) return null;

    const brand = style[`offer${offer.brand}`] || '';

    const body = (
        <>
            <span className={style.offerMark} aria-hidden="true"/>
            <span className={style.offerSpark} aria-hidden="true"/>
            <span className={style.offerDust} aria-hidden="true"/>

            <span className={style.offerBody}>
                <span className={style.offerTitle}>{offer.title}</span>
                {offer.note ? <span className={style.offerNote}>{offer.note}</span> : null}
            </span>
        </>
    );

    if (!route) return <div className={`${style.offer} ${brand}`}>{body}</div>;

    return (
        <button type="button" className={`${style.offer} ${brand}`} onClick={() => onOpen(route)}>
            {body}
            <span className={style.offerChevron} aria-hidden="true">›</span>
        </button>
    );
}
