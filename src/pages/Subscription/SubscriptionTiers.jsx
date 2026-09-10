import React from 'react';
import {formatPrice} from '../Main/catalogSections';
import style from './Subscription.module.scss';

const CARD_LIMIT = 2;

export default function SubscriptionTiers({tiers, activeKey, onSelect}) {
    if (tiers.length < 2) return null;

    const asCards = tiers.length <= CARD_LIMIT;

    return (
        <section className={style.block}>
            <h2 className={style.blockTitle}>{asCards ? 'Куда активируем' : 'Тариф'}</h2>

            <div className={asCards ? style.tierCards : style.tierPills}>
                {tiers.map((tier) => {
                    const isActive = tier.key === activeKey;
                    const from = tier.fromPerMonth ?? tier.fromPrice;

                    return (
                        <button
                            key={tier.key}
                            type="button"
                            className={`${asCards ? style.tierCard : style.tierPill} ${isActive ? style.tierActive : ''}`}
                            style={{'--tier-dot': tier.dot}}
                            aria-pressed={isActive}
                            onClick={() => onSelect(tier.key)}
                        >
                            <span className={style.tierName}>
                                <span className={style.tierDot} aria-hidden="true"/>
                                {tier.name}
                            </span>

                            {asCards ? (
                                <>
                                    {tier.tagline ? <span className={style.tierNote}>{tier.tagline}</span> : null}
                                    {from ? (
                                        <span className={style.tierFrom}>
                                            от {formatPrice(from)}{tier.fromPerMonth ? ' / мес' : ''}
                                        </span>
                                    ) : null}
                                </>
                            ) : null}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
