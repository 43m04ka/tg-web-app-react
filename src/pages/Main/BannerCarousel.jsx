import React, {useCallback, useEffect, useRef, useState} from 'react';
import {hapticSelection} from '../../shared/lib/haptic';
import style from './BannerCarousel.module.scss';

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
                {items.map((item) => (
                    <article
                        key={item.id}
                        className={style.slide}
                        style={{background: item.gradient}}
                    >
                        <div className={style.glow} aria-hidden="true"/>
                        <div className={style.top}>
                            {item.kicker ? <span className={style.kicker}>{item.kicker}</span> : null}
                            <h2 className={style.title}>{item.title}</h2>
                        </div>
                        {item.note ? <span className={style.note}>{item.note}</span> : null}
                    </article>
                ))}
            </div>

            {items.length > 1 ? (
                <div className={style.dots}>
                    {items.map((item, index) => (
                        <button
                            key={item.id}
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
