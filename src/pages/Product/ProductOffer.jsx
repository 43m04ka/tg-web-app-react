import React from 'react';
import style from './Product.module.scss';

export default function ProductOffer({offer, route, onOpen}) {
    if (!offer) return null;

    const body = (
        <span className={style.offerBody}>
            <span className={style.offerTitle}>{offer.title}</span>
            {offer.note ? <span className={style.offerNote}>{offer.note}</span> : null}
        </span>
    );

    if (!route) return <div className={style.offer}>{body}</div>;

    return (
        <button type="button" className={style.offer} onClick={() => onOpen(route)}>
            {body}
            <span className={style.offerChevron} aria-hidden="true">›</span>
        </button>
    );
}
