import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {discountPercent, formatPrice, formatPromoDate} from '../../../pages/Main/bannerFormat';
import {ChevronIcon} from '../../shell/DesktopIcons';
import {splitHero} from '../../model/storefrontModel';
import {useImageReady} from '../../ui/Cover';
import OriginMark from './OriginMark';
import style from './Storefront.module.scss';

const MAIN_AUTOPLAY_MS = 6000;
const SIDE_AUTOPLAY_MS = 7500;

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

function SideSlide({item, onOpen}) {
    const isReady = useImageReady(item.cover);
    const {price, oldPrice, footnote} = bannerPrices(item);

    return (
        <article className={style.sideSlide} onClick={() => onOpen?.(item)}>
            <span className={style.heroImage} style={imageStyle(item.cover, item, isReady, 'center')} aria-hidden="true"/>

            <div className={`${style.heroBody} ${item.shade ? '' : style.noShade}`}>
                <span className={style.heroTop}>
                    {item.subtitle ? <span className={style.heroTag}>{item.subtitle}</span> : null}
                    <OriginMark origin={item.origin} className={style.heroOrigin}/>
                </span>

                <span className={style.sideName}>{item.title}</span>

                {price ? (
                    <span className={style.heroPrices}>
                        <span className={style.heroPrice}>{price}</span>
                        {oldPrice ? <span className={style.heroOldPrice}>{oldPrice}</span> : null}
                    </span>
                ) : footnote ? <span className={style.heroNote}>{footnote}</span> : null}
            </div>
        </article>
    );
}

function MainSlide({item, onOpen, onButton}) {
    const isReady = useImageReady(item.image);
    const {percent, price, oldPrice, footnote} = bannerPrices(item);
    const hasButtons = item.buttons.length > 0;

    return (
        <article
            className={`${style.mainSlide} ${hasButtons ? '' : style.mainSlideClickable}`}
            onClick={hasButtons ? undefined : () => onOpen?.(item)}
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
    const [active, setActive] = useState(0);

    const count = items.length;

    const goTo = useCallback((index) => {
        const track = trackRef.current;
        if (!track) return;

        track.scrollTo({left: ((index + count) % count) * track.clientWidth, behavior: 'smooth'});
    }, [count]);

    const measure = useCallback(() => {
        const track = trackRef.current;
        if (track?.clientWidth) setActive(Math.round(track.scrollLeft / track.clientWidth));
    }, []);

    useEffect(() => {
        if (count <= 1) return undefined;

        const timer = setInterval(() => {
            if (!pausedRef.current && !document.hidden) goTo(active + 1);
        }, interval);

        return () => clearInterval(timer);
    }, [active, count, goTo, interval]);

    return (
        <div
            className={`${style.carousel} ${className}`}
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
        >
            <div ref={trackRef} className={style.carouselTrack} onScroll={measure}>
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
                                onClick={() => goTo(index)}
                            />
                        ))}
                    </span>
                </>
            ) : null}
        </div>
    );
}

export default function StorefrontHero({items, onOpen}) {
    const navigate = useNavigate();
    const {main, side} = splitHero(items);

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

    if (!main.length && !side.length) return null;

    return (
        <div className={`${style.hero} ${side.length && main.length ? '' : style.heroSolo}`}>
            {main.length ? (
                <Carousel items={main} interval={MAIN_AUTOPLAY_MS} className="" label="Баннер">
                    {(item) => <MainSlide key={item.id} item={item} onOpen={onOpen} onButton={openButton}/>}
                </Carousel>
            ) : null}

            {side.length ? (
                <Carousel items={side} interval={SIDE_AUTOPLAY_MS} className={style.sideViewport} label="Малый баннер">
                    {(item) => <SideSlide key={item.id} item={item} onOpen={onOpen}/>}
                </Carousel>
            ) : null}
        </div>
    );
}
