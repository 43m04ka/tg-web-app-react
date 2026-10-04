import React from 'react';
import {discountPercent, formatPrice, shortPlatform} from '../Main/catalogSections';
import {accentStyle} from './accent';
import fireIcon from '../../shared/assets/icons/fire.png';
import MembershipBadge from '../../shared/ui/MembershipBadge/MembershipBadge';
import style from './PopularRail.module.scss';

export default function PopularRail({items, regionOf, onOpen, orderOf}) {
    if (!items.length) return null;

    return (
        <section className={style.rail}>
            <div className={style.head}>
                <img className={style.headIcon} src={fireIcon} alt="" aria-hidden="true"/>
                <span className={style.title}>Популярное</span>
            </div>

            <div className={style.row}>
                {items.map(({id, product}) => {
                    const percent = discountPercent(product.price, product.oldPrice);
                    const tag = shortPlatform(product.platform) || product.typeLabel;
                    const region = regionOf?.(product);

                    return (
                        <article
                            key={id}
                            className={style.card}
                            style={{'--i': orderOf ? orderOf(id) : 0}}
                            onClick={() => onOpen(product)}
                        >
                            <span className={style.cardInner}>
                                <span
                                    className={style.cover}
                                    style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                                >
                                    {region || percent > 0 ? (
                                        <span className={style.topRow}>
                                            {region ? (
                                                <span
                                                    className={`${style.regionBadge} ${region.color ? style.regionBadgeTinted : ''}`}
                                                    style={region.color ? accentStyle(region.color) : undefined}
                                                >
                                                    {region.icon ? (
                                                        <span
                                                            className={style.regionBadgeIcon}
                                                            style={{backgroundImage: `url(${region.icon})`}}
                                                            aria-hidden="true"
                                                        />
                                                    ) : null}
                                                    <span className={style.regionBadgeTitle}>{region.title}</span>
                                                </span>
                                            ) : null}

                                            {percent > 0 ? <span className={style.discount}>−{percent}%</span> : null}
                                        </span>
                                    ) : null}

                                    {tag ? <span className={style.tag}>{tag}</span> : null}

                                    <MembershipBadge product={product}/>
                                </span>

                                <span className={style.name}>{product.name}</span>

                                <span className={style.prices}>
                                    <span className={style.price}>{formatPrice(product.price)}</span>
                                    {percent > 0 ? (
                                        <span className={style.oldPrice}>{formatPrice(product.oldPrice)}</span>
                                    ) : null}
                                </span>
                            </span>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
