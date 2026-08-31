import React, {useCallback, useEffect, useState} from 'react';
import {useCarouselTrack} from '../../shared/hooks/useCarouselTrack';
import {hapticImpact} from '../../shared/lib/haptic';
import style from './Product.module.scss';

function Shot({url, index, onOpen}) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <button
            type="button"
            className={style.shot}
            onClick={() => onOpen(index)}
            aria-label={`Скриншот ${index + 1}`}
        >
            <img
                className={`${style.shotImage} ${isLoaded ? style.shotImageShown : ''}`}
                src={url}
                alt=""
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                onError={() => setIsLoaded(true)}
            />
        </button>
    );
}

export default function ProductGallery({images}) {
    const [openedIndex, setOpenedIndex] = useState(null);
    const {trackRef, active, handleScroll, scrollToSlide} = useCarouselTrack();

    const close = useCallback(() => setOpenedIndex(null), []);

    useEffect(() => {
        if (openedIndex === null) return undefined;

        scrollToSlide(openedIndex);

        const onKeyDown = (event) => {
            if (event.key === 'Escape') close();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [openedIndex, scrollToSlide, close]);

    if (!Array.isArray(images) || images.length === 0) return null;

    const open = (index) => {
        hapticImpact('light');
        setOpenedIndex(index);
    };

    return (
        <section className={style.section}>
            <h2 className={style.sectionTitle}>Скриншоты</h2>

            <div className={style.shots}>
                {images.map((url, index) => (
                    <Shot key={url} url={url} index={index} onOpen={open}/>
                ))}
            </div>

            {openedIndex !== null ? (
                <div className={style.viewer} role="dialog" aria-modal="true">
                    <div className={style.viewerBar}>
                        <button type="button" className={style.viewerClose} onClick={close} aria-label="Закрыть">
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2"
                                      strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>

                    <div className={style.viewerTrack} ref={trackRef} onScroll={handleScroll}>
                        {images.map((url) => (
                            <div key={url} className={style.viewerSlide}>
                                <img className={style.viewerImage} src={url} alt=""/>
                            </div>
                        ))}
                    </div>

                    {images.length > 1 ? (
                        <div className={style.viewerDots}>
                            {images.map((url, index) => (
                                <button
                                    key={url}
                                    type="button"
                                    className={`${style.viewerDot} ${index === active ? style.viewerDotActive : ''}`}
                                    onClick={() => scrollToSlide(index)}
                                    aria-label={`Скриншот ${index + 1}`}
                                />
                            ))}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </section>
    );
}
