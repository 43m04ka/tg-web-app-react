import React, {useEffect, useState} from 'react';
import {fetchTurkeyPrices} from '../../shared/api/basket';
import {money} from '../Basket/cartModel';
import style from './ProductFulfillment.module.scss';

function FulfillmentOption({active, label, price, note, onClick}) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            className={`${style.option} ${active ? style.optionActive : ''}`}
            onClick={onClick}
        >
            <span className={style.label}>{label}</span>
            {price !== null && price !== undefined ? (
                <span key={price} className={style.price}>{money(price)}</span>
            ) : null}
            <span className={style.hint}>{note}</span>
        </button>
    );
}

export default function ProductFulfillment({userId, tryAmount, managerPrice, isCodes, onChange}) {
    const [codesPrice, setCodesPrice] = useState(null);

    useEffect(() => {
        if (!userId || !tryAmount) return undefined;

        const controller = new AbortController();

        setCodesPrice(null);

        fetchTurkeyPrices(userId, [tryAmount], controller.signal)
            .then((result) => {
                if (controller.signal.aborted) return;

                const price = result?.prices?.[tryAmount];
                setCodesPrice(typeof price === 'number' ? price : null);
            })
            .catch(() => {});

        return () => controller.abort();
    }, [userId, tryAmount]);

    return (
        <div className={style.fulfillment}>
            <span className={style.title}>Способ выдачи</span>

            <div className={style.track} role="tablist">
                <span
                    className={`${style.pill} ${isCodes ? style.pillCodes : ''}`}
                    aria-hidden="true"
                />
                <FulfillmentOption
                    active={!isCodes}
                    label="Менеджер"
                    price={managerPrice}
                    note="пополнит на аккаунте"
                    onClick={() => onChange(false)}
                />
                <FulfillmentOption
                    active={isCodes}
                    label="Кодами сразу"
                    price={codesPrice}
                    note="автоматически после оплаты"
                    onClick={() => onChange(true)}
                />
            </div>

            <span key={isCodes ? 'codes' : 'manager'} className={style.note}>
                {isCodes
                    ? 'Коды пополнения PSN придут автоматически сразу после оплаты.'
                    : 'Менеджер пополнит баланс на вашем аккаунте после оплаты.'}
            </span>
        </div>
    );
}
