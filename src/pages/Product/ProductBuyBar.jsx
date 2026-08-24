import React from 'react';
import {formatPrice} from '../Main/catalogSections';
import style from './Product.module.scss';

export default function ProductBuyBar({
    total,
    oldTotal,
    isAvailable,
    count,
    isBusy,
    bottomInset,
    onAdd,
    onChangeCount,
    onOpenBasket
}) {
    return (
        <div
            className={style.buyBar}
            style={{paddingBottom: `calc(${bottomInset}px + 14 * var(--u))`}}
        >
            <div className={style.buyPrices}>
                <span key={total} className={style.buyPrice}>{formatPrice(total)}</span>
                {oldTotal ? <span className={style.buyOldPrice}>{formatPrice(oldTotal)}</span> : null}
            </div>

            {!isAvailable ? (
                <button type="button" className={style.buyDisabled} disabled>Нет в продаже</button>
            ) : count === 0 ? (
                <button type="button" className={style.buyAction} disabled={isBusy} onClick={onAdd}>
                    В корзину
                </button>
            ) : (
                <div className={style.buyGroup}>
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

                    <button type="button" className={style.buyOpen} onClick={onOpenBasket}>
                        В корзине ›
                    </button>
                </div>
            )}
        </div>
    );
}
