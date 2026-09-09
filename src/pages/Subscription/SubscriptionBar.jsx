import React from 'react';
import {formatPrice} from '../Main/catalogSections';
import style from './Subscription.module.scss';

export default function SubscriptionBar({
    period,
    summary,
    count,
    isBusy,
    bottomInset,
    onAdd,
    onChangeCount,
    onOpenBasket
}) {
    return (
        <div className={style.bar} style={{paddingBottom: `calc(${bottomInset}px + 14 * var(--u))`}}>
            <div className={style.barPrices}>
                <span key={period?.price} className={style.barPrice}>{formatPrice(period?.price)}</span>
                <span className={style.barNote}>{summary}</span>
            </div>

            {!period?.isAvailable ? (
                <button type="button" className={style.barDisabled} disabled>Нет в продаже</button>
            ) : count === 0 ? (
                <button type="button" className={style.barAction} disabled={isBusy} onClick={onAdd}>
                    В корзину
                </button>
            ) : (
                <div className={style.barGroup}>
                    <div className={style.counter}>
                        <button
                            type="button"
                            className={style.counterButton}
                            onClick={() => onChangeCount(count - 1)}
                            aria-label="Убрать одну штуку"
                        >
                            −
                        </button>
                        <span key={count} className={style.counterValue}>{count}</span>
                        <button
                            type="button"
                            className={`${style.counterButton} ${style.counterPlus}`}
                            onClick={() => onChangeCount(count + 1)}
                            aria-label="Добавить ещё одну штуку"
                        >
                            +
                        </button>
                    </div>

                    <button type="button" className={style.barOpen} onClick={onOpenBasket}>
                        В корзине ›
                    </button>
                </div>
            )}
        </div>
    );
}
