import React, {forwardRef, useEffect, useState} from 'react';
import BackPill from '../../shared/ui/BackPill/BackPill';
import {formatPrice} from '../Main/catalogSections';
import {hasValue} from './productView';
import style from './Product.module.scss';

const ProductHero = forwardRef(function ProductHero(
    {product, topInset, showBack, discount, promoUntil, isFavorite, onBack, onPlay, onToggleFavorite},
    ref
) {
    const cover = product.backgroundUrl || product.image;
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => setIsLoaded(false), [cover]);

    return (
        <div className={style.hero}>
            <div className={`${style.heroPlaceholder} ${isLoaded ? style.heroPlaceholderHidden : style.shimmer}`}
                 aria-hidden="true"/>

            {cover ? (
                <img
                    ref={ref}
                    className={`${style.heroImage} ${isLoaded ? style.heroImageShown : ''}`}
                    src={cover}
                    alt=""
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setIsLoaded(true)}
                />
            ) : null}

            <div className={style.heroShade} aria-hidden="true"/>

            {showBack ? (
                <BackPill
                    className={style.heroBack}
                    style={{top: `calc(${topInset}px + 10 * var(--u))`}}
                    onClick={onBack}
                />
            ) : null}

            {hasValue(product.videoUrl) ? (
                <button type="button" className={style.heroPlay} onClick={onPlay} aria-label="Смотреть трейлер">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 6.5 18 12l-9 5.5Z" fill="currentColor"/>
                    </svg>
                </button>
            ) : null}

            <div className={style.heroFoot}>
                {discount > 0 ? (
                    <div className={style.promo}>
                        <span className={style.promoBadge}>−{discount}%</span>
                        <span className={style.promoText}>
                            {promoUntil
                                ? `Скидка действует до ${promoUntil}`
                                : `Выгода ${formatPrice(Number(product.oldPrice) - Number(product.price))}`}
                        </span>
                    </div>
                ) : <span/>}

                <button
                    type="button"
                    className={`${style.heart} ${isFavorite ? style.heartActive : ''}`}
                    onClick={onToggleFavorite}
                    aria-pressed={isFavorite}
                    aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                            d="M12 20.4 4.6 13a4.8 4.8 0 0 1 6.8-6.8l.6.6.6-.6A4.8 4.8 0 0 1 19.4 13Z"
                            fill={isFavorite ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
});

export default ProductHero;
