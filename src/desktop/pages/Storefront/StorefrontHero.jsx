import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {discountPercent, formatPrice, formatPromoDate} from '../../../pages/Main/bannerFormat';
import {ChevronIcon} from '../../shell/DesktopIcons';
import {useImageReady} from '../../ui/Cover';
import OriginMark from './OriginMark';
import style from './Storefront.module.scss';

const MAIN_AUTOPLAY_MS = 6000;

const openFromKey = (event, open) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    open();
};

const bannerPrices = (item) => {
    const percent = discountPercent(item.price, item.oldPrice);
    const promo = formatPromoDate(item.promoEndDate);

    return {
        percent,
        price: formatPrice(item.price),
        oldPrice: percent > 0 ? formatPrice(item.oldPrice) : '',
        footnote: promo ? `Акция до ${promo}` : item.note
    };
};

const imageStyle = (image, item, isReady, position) => (image ? {
    backgroundImage: `url(${image})`,
    backgroundPosition: item.imageFit === 'coverTop' ? 'top center' : position,
    opacity: isReady ? 1 : 0
} : {background: item.gradient || undefined});

function MainSlide({item, onOpen, onButton}) {
    const isReady = useImageReady(item.image);
    const {percent, price, oldPrice, footnote} = bannerPrices(item);
    const hasButtons = item.buttons.length > 0;

    return (
        <article
            className={`${style.mainSlide} ${hasButtons ? '' : style.mainSlideClickable}`}
            onClick={hasButtons ? undefined : () => onOpen?.(item)}
            role={hasButtons ? undefined : 'link'}
            tabIndex={hasButtons ? undefined : 0}
            aria-label={hasButtons ? undefined : item.title}
            onKeyDown={hasButtons ? undefined : (event) => openFromKey(event, () => onOpen?.(item))}
        >
            <span className={style.mainImage} style={imageStyle(item.image, item, isReady, 'center right')} aria-hidden="true"/>

            <div className={`${style.mainBody} ${item.shade ? '' : style.noShade}`}>
                <span className={style.mainMeta}>
                    {item.subtitle ? <span className={style.mainTag}>{item.subtitle}</span> : null}
                    <OriginMark origin={item.origin} className={style.heroOrigin}/>
                </span>

                <span className={style.mainName}>{item.title}</span>

                {footnote ? <span className={style.mainNote}>{footnote}</span> : null}

                {price ? (
                    <span className={style.mainPrices}>
                        <span className={style.mainPrice}>{price}</span>
                        {oldPrice ? <span className={style.heroOldPrice}>{oldPrice}</span> : null}
                        {percent > 0 ? <span className={style.discount}>−{percent}%</span> : null}
                    </span>
                ) : null}

                {hasButtons ? (
                    <span className={style.mainButtons}>
                        {item.buttons.map((button, index) => (
                            <button
                                key={index}
                                type="button"
                                className={index === 0 ? style.mainButton : style.mainButtonGhost}
                                onClick={() => onButton(item, button)}
                            >
                                {button.label}
                            </button>
                        ))}
                    </span>
                ) : null}
            </div>
        </article>
    );
}

function Carousel({items, interval, className, label, children}) {
    const trackRef = useRef(null);
    const pausedRef = useRef(false);
    const focusedRef = useRef(false);
    const [isPaused, setPaused] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(() => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
    const [active, setActive] = useState(0);

    const count = items.length;
    const activeRef = useRef(active);
    activeRef.current = active;

    const goTo = useCallback((index) => {
        const track = trackRef.current;
        if (!track) return;

        track.scrollTo({left: ((index + count) % count) * track.clientWidth, behavior: reducedMotion ? 'instant' : 'smooth'});
    }, [count, reducedMotion]);

    const measure = useCallback(() => {
        const track = trackRef.current;
        if (track?.clientWidth) setActive(Math.round(track.scrollLeft / track.clientWidth));
    }, []);

    useEffect(() => {
        if (count <= 1 || isPaused || reducedMotion) return undefined;

        const timer = setInterval(() => {
            if (!pausedRef.current && !focusedRef.current && !document.hidden) goTo(active + 1);
        }, interval);

        return () => clearInterval(timer);
    }, [active, count, goTo, interval, isPaused, reducedMotion]);

    useEffect(() => {
        const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (!media) return undefined;
        const update = () => setReducedMotion(media.matches);
        media.addEventListener?.('change', update);
        return () => media.removeEventListener?.('change', update);
    }, []);

    useEffect(() => {
        const track = trackRef.current;
        if (!track || typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(() => track.scrollTo({left: activeRef.current * track.clientWidth, behavior: 'instant'}));
        observer.observe(track);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const slides = trackRef.current?.children;
        if (!slides) return;
        [...slides].forEach((slide, index) => {
            if (index === active) {
                slide.removeAttribute('inert');
                slide.removeAttribute('aria-hidden');
            } else {
                slide.setAttribute('inert', '');
                slide.setAttribute('aria-hidden', 'true');
            }
        });
    }, [active, count]);

    const onKeyDown = (event) => {
        if (event.target.closest('button, a, input')) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            goTo(active + (event.key === 'ArrowRight' ? 1 : -1));
        }
    };

    return (
        <div
            className={`${style.carousel} ${className}`}
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
            onFocusCapture={() => { focusedRef.current = true; }}
            onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) focusedRef.current = false; }}
            onKeyDown={onKeyDown}
            role="region" aria-roledescription="карусель" aria-label="Баннеры магазина"
        >
            <div ref={trackRef} className={style.carouselTrack} onScroll={measure} tabIndex={0} aria-label="Слайды карусели">
                {items.map((item) => children(item))}
            </div>

            {count > 1 ? (
                <>
                    <button
                        type="button"
                        className={`${style.heroArrow} ${style.heroArrowPrev}`}
                        aria-label={`${label}: предыдущий`}
                        onClick={() => goTo(active - 1)}
                    >
                        <ChevronIcon/>
                    </button>

                    <button
                        type="button"
                        className={`${style.heroArrow} ${style.heroArrowNext}`}
                        aria-label={`${label}: следующий`}
                        onClick={() => goTo(active + 1)}
                    >
                        <ChevronIcon/>
                    </button>

                    <span className={style.mainDots}>
                        {items.map((item, index) => (
                            <button
                                key={item.id}
                                type="button"
                                className={`${style.mainDot} ${index === active ? style.mainDotOn : ''}`}
                                aria-label={`${label} ${index + 1}`}
                                aria-current={index === active ? 'true' : undefined}
                                onClick={() => goTo(index)}
                            />
                        ))}
                    </span>
                    <button type="button" className={style.carouselPause} aria-label={isPaused ? 'Продолжить смену баннеров' : 'Приостановить смену баннеров'}
                        aria-pressed={isPaused} onClick={() => setPaused((value) => !value)}>{isPaused ? '▷' : 'Ⅱ'}</button>
                </>
            ) : null}
        </div>
    );
}

export default function StorefrontHero({items, onOpen}) {
    const navigate = useNavigate();
    const main = items || [];

    const openButton = useCallback((item, button) => {
        const {url} = button;

        if (!url) {
            onOpen?.(item);
            return;
        }

        if (url.startsWith('/')) {
            navigate(url);
            return;
        }

        let target = null;
        try {
            target = new URL(url);
        } catch {
            return;
        }

        if (target.origin === window.location.origin) navigate(`${target.pathname}${target.search}${target.hash}`);
        else window.open(url, '_blank', 'noopener');
    }, [navigate, onOpen]);

    if (!main.length) return null;

    return (
        <div className={`${style.hero} ${style.heroSolo}`}>
            {main.length ? (
                <Carousel key={main.map((item) => item.id).join('|')} items={main} interval={MAIN_AUTOPLAY_MS} className="" label="Баннер">
                    {(item) => <MainSlide key={item.id} item={item} onOpen={onOpen} onButton={openButton}/>}
                </Carousel>
            ) : null}

        </div>
    );
}
