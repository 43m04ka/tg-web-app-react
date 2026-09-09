import React from 'react';
import {formatPrice} from '../Main/catalogSections';
import style from './Subscription.module.scss';

export default function SubscriptionHero({brandName, tier, period, region}) {
    return (
        <div className={style.hero}>
            <span className={style.heroBlobA} aria-hidden="true"/>
            <span className={style.heroBlobB} aria-hidden="true"/>

            <div className={style.heroTop}>
                <div className={style.heroTitles}>
                    <span className={style.heroBrand}>{brandName}</span>
                    <span className={style.heroTier}>{tier.name}</span>
                </div>

                {region?.icon ? (
                    <img className={style.heroIcon} src={region.icon} alt="" aria-hidden="true"/>
                ) : null}
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
