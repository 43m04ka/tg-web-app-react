import React, {useMemo} from 'react';
import {buildPlan} from '../Subscription/subscriptionModel';
import {useSubscriptionProducts} from '../Subscription/useSubscriptionProducts';
import {formatPrice} from './catalogSections';
import style from './SubscriptionRail.module.scss';

const coverOf = (tier) => {
    const banner = tier.periods.find((period) => period.product?.fourToThreeBannerUrl)?.product.fourToThreeBannerUrl;
    return banner || tier.periods.find((period) => period.product?.image)?.product.image || null;
};

const entryOf = (tier) => tier.periods.find((period) => period.isAvailable) || tier.periods[0] || null;

const priceFrom = (tier) => {
    if (tier.fromPrice !== null) return tier.fromPrice;

    return tier.periods
        .map((period) => period.price)
        .filter((value) => value !== null)
        .sort((a, b) => a - b)[0] ?? null;
};

export const termRange = (tier) => {
    const months = tier.periods
        .map((period) => period.months)
        .filter((value) => value !== null);

    if (months.length === 0) return tier.periods.length === 1 ? tier.periods[0].label : '';

    const low = Math.min(...months);
    const high = Math.max(...months);

    return low === high ? `${low} мес` : `${low}–${high} мес`;
};

export const railTiers = (products, {catalogPath, title} = {}) =>
    buildPlan(products, {catalogPath, title})?.tiers || [];

export default function SubscriptionRail({products, catalogPath, title, onOpen}) {
    const catalogId = products?.[0]?.catalogId ?? null;
    const {items} = useSubscriptionProducts(catalogId, products);
    const source = items?.length ? items : products;

    const tiers = useMemo(
        () => railTiers(source, {catalogPath, title}),
        [source, catalogPath, title]
    );

    return (
        <div className={style.rail}>
            {tiers.map((tier) => {
                const entry = entryOf(tier);
                if (!entry) return null;

                const cover = coverOf(tier);
                const price = priceFrom(tier);
                const range = termRange(tier);

                return (
                    <button
                        key={tier.key}
                        type="button"
                        className={style.tier}
                        style={{'--tier-dot': tier.dot}}
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

                                {range ? <span className={style.terms}>{range}</span> : null}
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
