import React from 'react';
import {money} from '../Basket/cartModel';
import {monthsOf, themeOf, themeVars} from '../Services/servicesModel';
import style from './SubscriptionRail.module.scss';

const termsNote = (offers) => {
    const months = offers.map(monthsOf).filter((value) => Number.isFinite(value) && value > 0);
    if (!months.length) return `${offers.length} варианта`;

    const low = Math.min(...months);
    const high = Math.max(...months);

    return low === high ? `${low} мес.` : `${low}–${high} мес.`;
};

export default function SubscriptionRail({entry, onOpen}) {
    const theme = themeOf(entry.brand, 0);

    return (
        <div className={style.rail} style={themeVars(theme)}>
            {entry.tiers.map((tier) => (
                <button
                    key={tier.key || entry.brand.name}
                    type="button"
                    className={style.tier}
                    onClick={() => onOpen(entry, tier.key)}
                >
                    <span className={style.glow} aria-hidden="true"/>

                    <span className={style.head}>
                        <span className={style.brand}>
                            {entry.brand.icon ? (
                                <img className={style.brandIcon} src={entry.brand.icon} alt=""/>
                            ) : null}
                            {entry.brand.name}
                        </span>
                        <span className={style.name}>{tier.name}</span>
                    </span>

                    <span className={style.foot}>
                        <span className={style.priceBox}>
                            <span className={style.priceLabel}>от</span>
                            <span className={style.price}>{money(tier.price)}</span>
                        </span>
                        <span className={style.terms}>{termsNote(tier.offers)}</span>
                    </span>
                </button>
            ))}
        </div>
    );
}
