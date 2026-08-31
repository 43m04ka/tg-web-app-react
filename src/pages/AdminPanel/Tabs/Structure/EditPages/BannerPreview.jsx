import React from 'react';
import {discountPercent, formatPrice, formatPromoDate} from './bannerContent';
import s from './BannerPreview.module.scss';

// Превью в тех же пропорциях и с той же логикой кадрирования, что и карусель бота:
// 4:3, обложка без баннера прижата к верхнему краю, под ценами — размытие.
const BannerPreview = ({banner}) => {
    const data = banner?.data || {};
    const percent = discountPercent(data.price, data.oldPrice);
    const promo = formatPromoDate(data.promoEndDate);
    const price = formatPrice(data.price);
    const oldPrice = formatPrice(data.oldPrice);
    const hasPrices = Boolean(price);

    return (
        <div className={s.frame}>
            <div
                className={s.card}
                style={data.image
                    ? {backgroundImage: `url(${data.image})`, backgroundPosition: data.imageFit === 'coverTop' ? 'top center' : 'center'}
                    : {background: data.gradient || 'linear-gradient(115deg, #3b3b4f, #23232f)'}}
            >
                <div className={s.top}>
                    {data.subtitle ? <span className={s.kicker}>{data.subtitle}</span> : null}
                    <span className={s.title}>{data.title || 'Без названия'}</span>
                </div>

                {hasPrices || data.note ? (
                    <div className={s.bottom}>
                        <div className={s.blur} aria-hidden="true"/>
                        <div className={s.bottomBody}>
                            {hasPrices ? (
                                <div className={s.prices}>
                                    <span className={s.price}>{price}</span>
                                    {oldPrice && percent > 0 ? <span className={s.oldPrice}>{oldPrice}</span> : null}
                                    {percent > 0 ? <span className={s.badge}>−{percent}%</span> : null}
                                </div>
                            ) : null}
                            {promo ? <span className={s.note}>Акция до {promo}</span> : null}
                            {!promo && data.note ? <span className={s.note}>{data.note}</span> : null}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default BannerPreview;
