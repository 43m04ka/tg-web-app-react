import React from 'react';
import {discountPercent, formatPrice, platformList, subscriptionTerm} from '../../../pages/Main/catalogSections';
import style from './Storefront.module.scss';

export default function StorefrontCard({product, origin, onOpen}) {
    const percent = discountPercent(product.price, product.oldPrice);
    const platforms = platformList(product.platform);
    const price = formatPrice(product.price);
    const oldPrice = formatPrice(product.oldPrice);
    const term = subscriptionTerm(product);

    return (
        <article className={style.card} onClick={() => onOpen?.(product)}>
            <div
                className={style.cover}
                style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
            >
                {percent > 0 ? <span className={style.discount}>−{percent}%</span> : null}
                {term ? <span className={style.term}>{term}</span> : null}
            </div>

            <div className={style.meta}>
                {origin ? (
                    <span className={style.origin}>
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

                {platforms.length ? <span className={style.platform}>{platforms[0]}</span> : null}
            </div>

            <span className={style.name}>{product.name}</span>

            <span className={style.prices}>
                <span className={style.price}>{price}</span>
                {percent > 0 && oldPrice ? <span className={style.oldPrice}>{oldPrice}</span> : null}
            </span>
        </article>
    );
}
