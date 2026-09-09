import React from 'react';
import {formatPrice, isSubscription, subscriptionTerm} from './catalogSections';
import style from './SubscriptionRail.module.scss';

const MONTHS = [
    {re: /(\d+)\s*мес/i, factor: 1},
    {re: /(\d+)\s*(?:год|года|лет)/i, factor: 12}
];

const tierName = (product) => String(product.choiceColumn || product.name || '').trim();

const monthsOf = (product) => {
    const text = String(product.choiceRow || product.name || '');

    for (const {re, factor} of MONTHS) {
        const found = text.match(re);
        if (found) return Number(found[1]) * factor;
    }

    return null;
};

const monthlyNote = (product) => {
    const months = monthsOf(product);
    const price = Number(product.price);

    if (!months || months < 2 || !Number.isFinite(price) || price <= 0) return '';

    return `${formatPrice(Math.round(price / months))}/мес`;
};

export const subscriptionTiles = (products) => (products || [])
    .filter(isSubscription)
    .slice()
    .sort((a, b) => (a.serialNumber ?? 0) - (b.serialNumber ?? 0));

export default function SubscriptionRail({products, onOpen}) {
    return (
        <div className={style.rail}>
            {subscriptionTiles(products).map((product) => {
                const note = monthlyNote(product);
                const caption = product.image
                    ? [tierName(product), subscriptionTerm(product) || product.choiceRow].filter(Boolean).join(' · ')
                    : tierName(product);

                return (
                    <button
                        key={product.id}
                        type="button"
                        className={style.tier}
                        onClick={() => onOpen(product)}
                    >
                        <span
                            className={style.art}
                            style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                        >
                            {product.image ? null : (
                                <span className={style.plain} aria-hidden="true">
                                    <span className={style.plainGlyph}>{caption.slice(0, 1).toUpperCase() || '·'}</span>
                                </span>
                            )}
                        </span>

                        <span className={style.body}>
                            <span className={style.name}>{caption}</span>

                            <span className={style.foot}>
                                <span className={style.price}>{formatPrice(product.price)}</span>
                                {note ? <span className={style.terms}>{note}</span> : null}
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
