import React from 'react';
import {discountPercent, formatPrice, shortPlatform} from '../Main/catalogSections';
import {accentStyle} from './accent';
import style from './PopularRail.module.scss';

export default function PopularRail({items, regionOf, onOpen}) {
    if (!items.length) return null;

    return (
        <section className={style.rail}>
            <div className={style.head}>
                <span className={style.title}>Популярное</span>
            </div>

            <div className={style.row}>
                {items.map(({id, product}) => {
                    const percent = discountPercent(product.price, product.oldPrice);
                    const tag = shortPlatform(product.platform) || product.typeLabel;
                    const region = regionOf?.(product);

                    return (
                        <article key={id} className={style.card} onClick={() => onOpen(product)}>
                            <span
                                className={style.cover}
                                style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                            >
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

                                {tag ? <span className={style.tag}>{tag}</span> : null}
                                {percent > 0 ? <span className={style.discount}>−{percent}%</span> : null}
                            </span>

                            <span className={style.name}>{product.name}</span>

                            <span className={style.prices}>
                                <span className={style.price}>{formatPrice(product.price)}</span>
                                {percent > 0 ? (
                                    <span className={style.oldPrice}>{formatPrice(product.oldPrice)}</span>
                                ) : null}
                            </span>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
