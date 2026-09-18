import React from 'react';
import {discountPercent, formatPrice, formatPromoDate} from '../../../pages/Main/bannerFormat';
import {useImageReady} from '../../ui/Cover';
import style from './Storefront.module.scss';

function HeroCard({item, index, onOpen}) {
    const isReady = useImageReady(item.image);

    const percent = discountPercent(item.price, item.oldPrice);
    const promo = formatPromoDate(item.promoEndDate);
    const footnote = promo ? `Акция до ${promo}` : item.note;
    const price = formatPrice(item.price);

    return (
        <article className={style.heroCard} style={{'--i': index}} onClick={() => onOpen?.(item)}>
            <span
                className={style.heroImage}
                style={{
                    backgroundImage: item.image ? `url(${item.image})` : undefined,
                    backgroundPosition: item.imageFit === 'coverTop' ? 'top center' : 'center',
                    opacity: isReady ? 1 : 0
                }}
                aria-hidden="true"
            />

            <div className={style.heroBody}>
                {item.subtitle ? <span className={style.heroTag}>{item.subtitle}</span> : null}

                {item.origin ? (
                    <span className={style.heroOrigin}>
                        {item.origin.icon ? (
                            <span
                                className={style.heroOriginIcon}
                                style={{backgroundImage: `url(${item.origin.icon})`}}
                                aria-hidden="true"
                            />
                        ) : null}
                        {item.origin.label}
                    </span>
                ) : null}

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
}

export default function StorefrontHero({items, onOpen}) {
    if (!items.length) return null;

    return (
        <div className={style.hero}>
            {items.map((item, index) => (
                <HeroCard key={item.id} item={item} index={index} onOpen={onOpen}/>
            ))}
        </div>
    );
}
