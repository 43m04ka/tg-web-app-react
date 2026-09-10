import React, {useMemo} from 'react';
import {buildPlan} from '../Subscription/subscriptionModel';
import {pluralOf} from '../../shared/lib/plural';
import {formatPrice} from './catalogSections';
import style from './SubscriptionRail.module.scss';

const PERIOD_WORDS = ['срок', 'срока', 'сроков'];

const coverOf = (tier) => tier.periods.find((period) => period.product?.image)?.product.image || null;

const entryOf = (tier) => tier.periods.find((period) => period.isAvailable) || tier.periods[0] || null;

const priceFrom = (tier) => {
    if (tier.fromPrice !== null) return tier.fromPrice;

    return tier.periods
        .map((period) => period.price)
        .filter((value) => value !== null)
        .sort((a, b) => a - b)[0] ?? null;
};

export const railTiers = (products, {catalogPath, title} = {}) =>
    buildPlan(products, {catalogPath, title})?.tiers || [];

export default function SubscriptionRail({products, catalogPath, title, onOpen}) {
    const tiers = useMemo(
        () => railTiers(products, {catalogPath, title}),
        [products, catalogPath, title]
    );

    return (
        <div className={style.rail}>
            {tiers.map((tier) => {
                const entry = entryOf(tier);
                if (!entry) return null;

                const cover = coverOf(tier);
                const price = priceFrom(tier);
                const count = tier.periods.length;

                return (
                    <button
                        key={tier.key}
                        type="button"
                        className={style.tier}
                        style={{'--tier-accent': tier.accent}}
                        onClick={() => onOpen(entry.product)}
                    >
                        <span
                            className={style.art}
                            style={cover ? {backgroundImage: `url(${cover})`} : undefined}
                        >
                            {cover ? null : (
                                <span className={style.plain} aria-hidden="true">
                                    <span className={style.plainGlyph}>
                                        {tier.name.slice(0, 1).toUpperCase() || '·'}
                                    </span>
                                </span>
                            )}
                        </span>

                        <span className={style.body}>
                            <span className={style.name}>
                                <span className={style.dot} aria-hidden="true"/>
                                {tier.name}
                            </span>

                            <span className={style.foot}>
                                {price === null ? (
                                    <span className={style.price}>Нет в наличии</span>
                                ) : (
                                    <span className={style.price}>
                                        <span className={style.from}>от</span>
                                        {formatPrice(price)}
                                    </span>
                                )}

                                {count > 1 ? (
                                    <span className={style.terms}>
                                        {count} {pluralOf(count, PERIOD_WORDS)}
                                    </span>
                                ) : null}
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
