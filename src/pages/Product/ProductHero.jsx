import React, {forwardRef} from 'react';
import BackCircle from './BackCircle';
import {hasValue} from './productView';
import style from './Product.module.scss';

const ProductHero = forwardRef(function ProductHero(
    {product, topInset, discount, isFavorite, onBack, onToggleFavorite, onPlay},
    ref
) {
    const cover = product.backgroundUrl || product.image;

    return (
        <div className={style.hero}>
            <div
                ref={ref}
                className={style.heroImage}
                style={cover ? {backgroundImage: `url(${cover})`} : undefined}
                aria-hidden="true"
            />
            <div className={style.heroShade} aria-hidden="true"/>

            <div className={style.heroBar} style={{top: `calc(${topInset}px + 10 * var(--u))`}}>
                <BackCircle className={style.heroAction} onClick={onBack}/>

                <button
                    type="button"
                    className={`${style.heroAction} ${isFavorite ? style.heroActionActive : ''}`}
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

            {hasValue(product.videoUrl) ? (
                <button type="button" className={style.heroPlay} onClick={onPlay} aria-label="Смотреть трейлер">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 6.5 18 12l-9 5.5Z" fill="currentColor"/>
                    </svg>
                </button>
            ) : null}

            <div className={style.heroTags}>
                {discount > 0 ? <span className={style.heroDiscount}>🔥 −{discount}%</span> : null}
                {hasValue(product.regionActivate) ? (
                    <span className={style.heroTag}>Регион: {product.regionActivate}</span>
                ) : null}
            </div>
        </div>
    );
});

export default ProductHero;
