import React from 'react';
import {formatPrice} from '../Main/catalogSections';
import style from './Subscription.module.scss';

export default function SubscriptionHero({
    brandName,
    tier,
    period,
    region,
    isFavorite,
    onToggleFavorite
}) {
    return (
        <div className={style.hero}>
            <span className={style.heroBlobA} aria-hidden="true"/>
            <span className={style.heroBlobB} aria-hidden="true"/>

            <div className={style.heroTop}>
                <div className={style.heroTitles}>
                    <span className={style.heroBrand}>{brandName}</span>
                    <span className={style.heroTier}>{tier.name}</span>
                </div>

                <div className={style.heroActions}>
                    {region?.icon ? (
                        <img className={style.heroIcon} src={region.icon} alt="" aria-hidden="true"/>
                    ) : null}

                    {onToggleFavorite ? (
                        <button
                            type="button"
                            className={`${style.heroFav} ${isFavorite ? style.heroFavOn : ''}`}
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
                    ) : null}
                </div>
            </div>

            <div className={style.heroLine} aria-hidden="true"/>

            <div className={style.heroBottom}>
                <div className={style.heroCell}>
                    <span className={style.heroLabel}>{tier.tagline ? 'Тариф включает' : 'Срок'}</span>
                    <span className={style.heroValue}>{tier.tagline || period?.label || '—'}</span>
                </div>

                <div className={`${style.heroCell} ${style.heroCellEnd}`}>
                    <span className={style.heroLabel}>{region ? 'Регион' : 'Цена за месяц'}</span>
                    <span className={style.heroValue}>
                        {region ? region.title : (period?.perMonth ? `${formatPrice(period.perMonth)} / мес` : '—')}
                    </span>
                </div>
            </div>
        </div>
    );
}
