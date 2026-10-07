import React, {useCallback, useEffect, useRef, useState} from 'react';
import {discountPercent, formatPrice, formatPromoDate} from '../../../pages/Main/bannerFormat';
import {ChevronIcon} from '../../shell/DesktopIcons';
import {useImageReady} from '../../ui/Cover';
import style from './Storefront.module.scss';

const AUTOPLAY_MS = 6000;

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

function HeroTrack({items, lead, perView, onOpen}) {
    const offset = lead ? 1 : 0;
    const count = items.length + offset;
    const trackRef = useRef(null);
    const pausedRef = useRef(false);
    const [edges, setEdges] = useState({start: true, end: true});

    const measure = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;

        const max = track.scrollWidth - track.clientWidth;
        setEdges({start: track.scrollLeft <= 2, end: track.scrollLeft >= max - 2});
    }, []);

    const step = useCallback((direction) => {
        const track = trackRef.current;
        if (!track) return;

        const card = track.firstElementChild;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const width = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
        const max = track.scrollWidth - track.clientWidth;

        if (direction > 0 && track.scrollLeft >= max - 2) {
            track.scrollTo({left: 0, behavior: 'smooth'});
            return;
        }

        track.scrollBy({left: direction * width, behavior: 'smooth'});
    }, []);

    useEffect(() => {
        measure();

        const track = trackRef.current;
        if (!track || typeof ResizeObserver === 'undefined') return undefined;

        const observer = new ResizeObserver(measure);
        observer.observe(track);

        return () => observer.disconnect();
    }, [measure, count]);

    useEffect(() => {
        if (count <= perView) return undefined;

        const timer = setInterval(() => {
            if (!pausedRef.current && !document.hidden) step(1);
        }, AUTOPLAY_MS);

        return () => clearInterval(timer);
    }, [count, perView, step]);

    const scrollable = !(edges.start && edges.end);

    return (
        <div
            className={style.heroViewport}
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
        >
            <div
                ref={trackRef}
                className={style.heroTrack}
                style={{'--per-view': perView}}
                onScroll={measure}
            >
                {lead}
                {items.map((item, index) => (
                    <HeroCard key={item.id} item={item} index={index + offset} onOpen={onOpen}/>
                ))}
            </div>

            {scrollable ? (
                <>
                    <button
                        type="button"
                        className={`${style.heroArrow} ${style.heroArrowPrev}`}
                        disabled={edges.start}
                        aria-label="Предыдущий баннер"
                        onClick={() => step(-1)}
                    >
                        <ChevronIcon/>
                    </button>

                    <button
                        type="button"
                        className={`${style.heroArrow} ${style.heroArrowNext}`}
                        aria-label="Следующий баннер"
                        onClick={() => step(1)}
                    >
                        <ChevronIcon/>
                    </button>
                </>
            ) : null}
        </div>
    );
}

export default function StorefrontHero({items, onOpen, onBrand, perView = 3}) {
    const hasBrand = typeof onBrand === 'function';

    if (!items.length && !hasBrand) return null;

    const lead = hasBrand ? (
        <button key="brand" type="button" className={style.brandCard} style={{'--i': 0}} onClick={onBrand}>
            <span className={style.brandGlow} aria-hidden="true"/>

            <h1 className={style.brandTitle}>
                Геймворд — игры и подписки для <span className={style.ps}>PlayStation</span> и{' '}
                <span className={style.xbox}>Xbox</span>
            </h1>
        </button>
    ) : null;

    return (
        <div className={style.hero}>
            <HeroTrack items={items} lead={lead} perView={Math.max(1, perView)} onOpen={onOpen}/>
        </div>
    );
}
