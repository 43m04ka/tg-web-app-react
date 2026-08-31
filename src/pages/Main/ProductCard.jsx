import React from 'react';
import {discountPercent, formatPrice, platformList, subscriptionTerm} from './catalogSections';
import style from './CatalogSection.module.scss';

export default function ProductCard({product, onOpen}) {
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
                <div className={style.tags}>
                    {platforms.map((item) => (
                        <span key={item} className={style.tag}>{item}</span>
                    ))}
                    {product.typeLabel ? <span className={style.tag}>{product.typeLabel}</span> : null}
                </div>

                {percent > 0 ? <span className={style.discount}>−{percent}%</span> : null}

                {term ? <span className={style.term}>{term}</span> : null}
            </div>

            <span className={style.name}>{product.name}</span>

            <span className={style.prices}>
                <span className={style.price}>{price}</span>
                {percent > 0 && oldPrice ? <span className={style.oldPrice}>{oldPrice}</span> : null}
            </span>
        </article>
    );
}
