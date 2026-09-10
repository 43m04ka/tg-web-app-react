import React from 'react';
import {pluralOf} from '../../shared/lib/plural';
import {formatPrice} from '../Main/catalogSections';
import style from './Subscription.module.scss';

const ROW_LIMIT = 4;

const VARIANT_WORDS = ['вариант', 'варианта', 'вариантов'];

export default function SubscriptionPeriods({tier, activeId, onSelect}) {
    const {periods, hint} = tier;
    if (periods.length === 0) return null;

    const asRows = periods.length <= ROW_LIMIT;

    return (
        <section className={style.block}>
            <div className={style.blockHead}>
                <h2 className={style.blockTitle}>Срок подписки</h2>
                {periods.length > 1 ? (
                    <span className={style.blockNote}>{periods.length} {pluralOf(periods.length, VARIANT_WORDS)}</span>
                ) : null}
            </div>

            <div className={asRows ? style.rows : style.chips}>
                {periods.map((period) => {
                    const isActive = period.id === activeId;
                    const className = `${asRows ? style.row : style.chip}`
                        + ` ${isActive ? style.periodActive : ''}`
                        + ` ${period.isAvailable ? '' : style.periodLocked}`;

                    return (
                        <button
                            key={period.id}
                            type="button"
                            className={className}
                            disabled={!period.isAvailable}
                            aria-pressed={isActive}
                            onClick={() => onSelect(period.id)}
                        >
                            {asRows ? (
                                <>
                                    <span className={`${style.tick} ${isActive ? style.tickOn : ''}`} aria-hidden="true">✓</span>

                                    <span className={style.rowBody}>
                                        <span className={style.rowTitle}>
                                            <span className={style.rowName}>{period.label}</span>
                                            {period.badge ? <span className={style.badge}>{period.badge}</span> : null}
                                        </span>

                                        <span className={style.rowNote}>
                                            {period.isAvailable
                                                ? (period.perMonth ? `${formatPrice(period.perMonth)} / мес` : 'Разовая оплата')
                                                : 'Нет в продаже'}
                                        </span>
                                    </span>

                                    <span className={style.rowPrices}>
                                        <span className={style.rowPrice}>{formatPrice(period.price)}</span>
                                        {period.oldPrice ? (
                                            <span className={style.rowOldPrice}>{formatPrice(period.oldPrice)}</span>
                                        ) : null}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className={style.chipName}>{period.label}</span>
                                    <span className={style.chipPrice}>{formatPrice(period.price)}</span>
                                    {period.badge ? <span className={style.chipBadge}>{period.badge}</span> : null}
                                </>
                            )}
                        </button>
                    );
                })}
            </div>

            {hint ? (
                <p className={style.hint}>
                    <span className={style.hintMark} aria-hidden="true">📉</span>
                    {hint}
                </p>
            ) : null}
        </section>
    );
}
