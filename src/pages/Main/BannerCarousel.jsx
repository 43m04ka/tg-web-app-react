import React, {useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {hapticImpact} from '../../shared/lib/haptic';
import {useCarouselTrack} from '../../shared/hooks/useCarouselTrack';
import {getTelegramObject} from '../../shared/lib/telegram';
import {discountPercent, formatPrice, formatPromoDate} from './bannerFormat';
import style from './BannerCarousel.module.scss';

const SKELETONS = ['a', 'b'];

const slideBackground = (data) => {
    if (data.image) {
        return {
            backgroundImage: `url(${data.image})`,
            // Обложки без баннера 4:3 вертикальные: центр режет логотип и лицо пополам,
            // поэтому кадрируем по верхнему краю
            backgroundPosition: data.imageFit === 'coverTop' ? 'top center' : 'center'
        };
    }

    return {background: data.gradient || 'linear-gradient(115deg, var(--accent-soft), var(--bg-elevated))'};
};

const bannerProductId = (banner) => {
    if (banner.type !== 'product') return null;

    const id = banner.data?.productId;
    return id === null || id === undefined || id === '' ? null : id;
};

export default function BannerCarousel({items}) {
    const {trackRef, active, handleScroll, scrollToSlide} = useCarouselTrack();
    const navigate = useNavigate();

    const openBanner = useCallback((banner) => {
        const productId = bannerProductId(banner);
        const url = banner.data?.url;
        if (!productId && !url) return;

        hapticImpact('light');

        if (productId) {
            navigate(`/card/${productId}`);
            return;
        }

        const tg = getTelegramObject();
        if (typeof tg.openLink === 'function') tg.openLink(url);
        else window.open(url, '_blank', 'noopener');
    }, [navigate]);

    // Пока баннеров нет — держим место серыми прямоугольниками и не сворачиваемся.
    // Схлопнуть карусель значило бы дёрнуть вверх всё, что под ней, и дёрнуть обратно,
    // когда данные придут.
    if (!items?.length) {
        return (
            <section className={style.carousel} aria-label="Баннеры загружаются" aria-busy="true">
                <div className={style.track}>
                    {SKELETONS.map((key) => (
                        <div key={key} className={`${style.slide} ${style.skeleton}`} aria-hidden="true"/>
                    ))}
                </div>

                <div className={style.dots} aria-hidden="true">
                    {SKELETONS.map((key) => <span key={key} className={style.dot}/>)}
                </div>
            </section>
        );
    }

    return (
        <section className={style.carousel} aria-label="Баннеры">
            <div className={style.track} ref={trackRef} onScroll={handleScroll}>
                {items.map((banner) => {
                    const data = banner.data || {};
                    const price = formatPrice(data.price);
                    const oldPrice = formatPrice(data.oldPrice);
                    const percent = discountPercent(data.price, data.oldPrice);
                    const promo = formatPromoDate(data.promoEndDate);
                    const footnote = promo ? `Акция до ${promo}` : data.note;
                    const hasBottom = Boolean(price || footnote);
                    const isClickable = Boolean(bannerProductId(banner) || data.url);

                    return (
                        <article
                            key={banner.id}
                            className={`${style.slide} ${isClickable ? style.slideClickable : ''}`}
                            style={slideBackground(data)}
                            onClick={isClickable ? () => openBanner(banner) : undefined}
                        >
                            <div className={style.scrim} aria-hidden="true"/>

                            <div className={style.top}>
                                {data.subtitle ? <span className={style.kicker}>{data.subtitle}</span> : null}
                                <h2 className={style.title}>{data.title}</h2>
                            </div>

                            {hasBottom ? (
                                <div className={style.bottom}>
                                    {price ? (
                                        <div className={style.prices}>
                                            <span className={style.price}>{price}</span>
                                            {percent > 0 && oldPrice ? (
                                                <span className={style.oldPrice}>{oldPrice}</span>
                                            ) : null}
                                            {percent > 0 ? (
                                                <span className={style.badge}>−{percent}%</span>
                                            ) : null}
                                        </div>
                                    ) : null}
                                    {footnote ? <span className={style.note}>{footnote}</span> : null}
                                </div>
                            ) : null}
                        </article>
                    );
                })}
            </div>

            {items.length > 1 ? (
                <div className={style.dots}>
                    {items.map((banner, index) => (
                        <button
                            key={banner.id}
                            type="button"
                            className={`${style.dot} ${index === active ? style.dotActive : ''}`}
                            onClick={() => scrollToSlide(index)}
                            aria-label={`Баннер ${index + 1}`}
                            aria-current={index === active ? 'true' : undefined}
                        />
                    ))}
                </div>
            ) : null}
        </section>
    );
}
