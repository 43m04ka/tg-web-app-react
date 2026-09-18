import React from 'react';
import {discountPercent, formatPrice} from '../../../pages/Main/catalogSections';
import style from './Storefront.module.scss';

export default function StorefrontHero({items, onOpen}) {
    if (!items.length) return null;

    return (
        <div className={style.hero}>
            {items.map((item) => {
                const {product, origin, subtitle} = item;
                const percent = discountPercent(product.price, product.oldPrice);

                return (
                    <article
                        key={item.id}
                        className={style.heroCard}
                        style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                        onClick={() => onOpen?.(item)}
                    >
                        <div className={style.heroBody}>
                            {subtitle || origin ? (
                                <span className={style.heroTag}>{subtitle || origin.label}</span>
                            ) : null}

                            {origin ? <span className={style.heroOrigin}>{origin.label}</span> : null}

                            <span className={style.heroName}>{product.name}</span>

                            <span className={style.heroPrices}>
                                <span className={style.heroPrice}>{formatPrice(product.price)}</span>
                                {percent > 0 && product.oldPrice ? (
                                    <span className={style.heroOldPrice}>{formatPrice(product.oldPrice)}</span>
                                ) : null}
                            </span>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
