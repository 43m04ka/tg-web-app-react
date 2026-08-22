import React, {useCallback, useEffect, useRef, useState} from 'react';
import {hapticImpact, hapticSelection} from '../../shared/lib/haptic';
import {getTelegramObject} from '../../shared/lib/telegram';
import {discountPercent, formatPrice, formatPromoDate} from './bannerFormat';
import style from './BannerCarousel.module.scss';

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

const openBanner = (data) => {
    if (!data.url) return;

    hapticImpact('light');

    const tg = getTelegramObject();
    if (typeof tg.openLink === 'function') tg.openLink(data.url);
    else window.open(data.url, '_blank', 'noopener');
};

export default function BannerCarousel({items}) {
    const trackRef = useRef(null);
    const activeRef = useRef(0);
    const frameRef = useRef(0);
    const [active, setActive] = useState(0);

    const sync = useCallback(() => {
        const track = trackRef.current;
        const slides = track ? Array.from(track.children) : [];
        if (!slides.length) return;

        const origin = slides[0].offsetLeft;
        let nearest = 0;
        let best = Infinity;

        slides.forEach((slide, index) => {
            const distance = Math.abs(slide.offsetLeft - origin - track.scrollLeft);
            if (distance < best) {
                best = distance;
                nearest = index;
            }
        });

        if (nearest === activeRef.current) return;

        activeRef.current = nearest;
        setActive(nearest);
        hapticSelection();
    }, []);

    const handleScroll = useCallback(() => {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(sync);
    }, [sync]);

    useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

    const scrollToSlide = useCallback((index) => {
        const track = trackRef.current;
        const slide = track?.children[index];
        if (!slide) return;

        track.scrollTo({left: slide.offsetLeft - track.children[0].offsetLeft, behavior: 'smooth'});
    }, []);

    if (!items?.length) return null;

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

                    return (
                        <article
                            key={banner.id}
                            className={style.slide}
                            style={slideBackground(data)}
                            onClick={() => openBanner(data)}
                        >
                            <div className={style.top}>
                                {data.subtitle ? <span className={style.kicker}>{data.subtitle}</span> : null}
                                <h2 className={style.title}>{data.title}</h2>
                            </div>

                            {hasBottom ? (
                                <div className={style.bottom}>
                                    <div className={style.blur} aria-hidden="true"/>
                                    <div className={style.bottomBody}>
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
