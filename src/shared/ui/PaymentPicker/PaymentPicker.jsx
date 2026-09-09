import React from 'react';
import {isMethodAvailable, methodUnavailableReason} from '../../../pages/Basket/cartModel';
import style from './PaymentPicker.module.scss';

export default function PaymentPicker({methods, method, total, money, onSelect}) {
    if (!methods || methods.length < 2) return null;

    return (
        <div className={style.list}>
            {methods.map((option) => {
                const available = isMethodAvailable(option, total);
                const active = option.key === method;

                return (
                    <button
                        key={option.key}
                        type="button"
                        className={`${style.item} ${active ? style.itemActive : ''} ${available ? '' : style.itemLocked}`}
                        disabled={!available}
                        aria-pressed={active}
                        onClick={() => onSelect(option.key)}
                    >
                        <span
                            className={style.mark}
                            style={option.icon
                                ? {backgroundImage: `url(${process.env.PUBLIC_URL}/payments/${option.icon}.png)`}
                                : undefined}
                            aria-hidden="true"
                        />
                        <span className={style.body}>
                            <span className={style.title}>{option.title}</span>
                            <span className={style.note}>
                                {available ? option.note : methodUnavailableReason(option, money)}
                            </span>
                        </span>
                        <span className={`${style.radio} ${active ? style.radioOn : ''}`} aria-hidden="true">✓</span>
                    </button>
                );
            })}
        </div>
    );
}
