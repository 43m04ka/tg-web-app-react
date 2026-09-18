import React from 'react';
import {discountPercent, formatPrice, shortPlatform, subscriptionTerm} from '../../../pages/Main/catalogSections';
import style from './Storefront.module.scss';

export default function OfferCard({offer, onOpen, showOrigin = true, showAlso = true}) {
    const {product, price, oldPrice, origins} = offer;

    const percent = discountPercent(price, oldPrice);
    const platform = shortPlatform(product.platform);
    const term = subscriptionTerm(product);
    const origin = origins[0] || null;
    const alsoIn = origins.length - 1;

    return (
        <article className={style.card} onClick={() => onOpen?.(offer)}>
            <div
                className={style.cover}
                style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
            >
                {showOrigin && origin ? (
                    <span className={style.originBadge}>
                        {origin.icon ? (
                            <span
                                className={style.originIcon}
                                style={{backgroundImage: `url(${origin.icon})`}}
                                aria-hidden="true"
                            />
                        ) : null}
                        {origin.label}
                    </span>
                ) : null}

                {term ? <span className={style.term}>{term}</span> : null}
                {platform ? <span className={style.platform}>{platform}</span> : null}
            </div>

            <span className={style.name}>{product.name}</span>

            <span className={style.prices}>
                <span className={style.price}>{formatPrice(price)}</span>
                {percent > 0 ? <span className={style.discount}>−{percent}%</span> : null}
            </span>

            {percent > 0 && oldPrice ? (
                <span className={style.oldPrice}>{formatPrice(oldPrice)}</span>
            ) : null}

            {showAlso && alsoIn > 0 ? (
                <span className={style.alsoIn}>
                    {alsoIn === 1 ? `Ещё на ${origins[1].label}` : `Ещё на ${alsoIn} витринах`}
                </span>
            ) : null}
        </article>
    );
}
