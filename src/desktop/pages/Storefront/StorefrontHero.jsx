import React from 'react';
import {discountPercent, formatPrice, formatPromoDate} from '../../../pages/Main/bannerFormat';
import style from './Storefront.module.scss';

export default function StorefrontHero({items, onOpen}) {
    if (!items.length) return null;

    return (
        <div className={style.hero}>
            {items.map((item) => {
                const percent = discountPercent(item.price, item.oldPrice);
                const promo = formatPromoDate(item.promoEndDate);
                const footnote = promo ? `Акция до ${promo}` : item.note;
                const price = formatPrice(item.price);

                return (
                    <article
                        key={item.id}
                        className={style.heroCard}
                        style={item.image ? {
                            backgroundImage: `url(${item.image})`,
                            backgroundPosition: item.imageFit === 'coverTop' ? 'top center' : 'center'
                        } : undefined}
                        onClick={() => onOpen?.(item)}
                    >
                        <div className={style.heroBody}>
                            {item.subtitle ? <span className={style.heroTag}>{item.subtitle}</span> : null}

                            {item.origin ? <span className={style.heroOrigin}>{item.origin.label}</span> : null}

                            <span className={style.heroName}>{item.title}</span>

                            {price ? (
                                <span className={style.heroPrices}>
                                    <span className={style.heroPrice}>{price}</span>
                                    {percent > 0 ? (
                                        <span className={style.heroOldPrice}>{formatPrice(item.oldPrice)}</span>
                                    ) : null}
                                </span>
                            ) : null}

                            {footnote ? <span className={style.heroNote}>{footnote}</span> : null}
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
