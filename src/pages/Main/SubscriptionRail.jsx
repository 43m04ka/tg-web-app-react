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
                    <span
                        className={style.art}
                        style={tier.image ? {backgroundImage: `url(${tier.image})`} : undefined}
                    >
                        {tier.image ? null : (
                            <span className={style.plain} aria-hidden="true">
                                {entry.brand.icon
                                    ? <img className={style.plainIcon} src={entry.brand.icon} alt=""/>
                                    : <span className={style.plainGlyph}>{entry.brand.glyph}</span>}
                            </span>
                        )}
                    </span>

                    <span className={style.body}>
                        <span className={style.name}>{tier.name}</span>

                        <span className={style.foot}>
                            <span className={style.price}>
                                <span className={style.priceLabel}>от</span>
                                {money(tier.price)}
                            </span>
                            <span className={style.terms}>{termsNote(tier.offers)}</span>
                        </span>
                    </span>
                </button>
            ))}
        </div>
    );
}
