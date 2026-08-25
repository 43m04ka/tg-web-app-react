import React from 'react';
import {discountPercent, formatPrice, shortPlatform} from '../Main/catalogSections';
import style from './Catalog.module.scss';

const SKELETON_KEYS = ['a', 'b', 'c', 'd'];

export function ProductGridSkeleton({count = 4}) {
    return (
        <div className={style.grid} aria-hidden="true">
            {SKELETON_KEYS.slice(0, count).map((key) => (
                <div key={key} className={style.skeletonCard}>
                    <div className={`${style.skeletonCover} ${style.shimmer}`}/>
                    <div className={`${style.skeletonLine} ${style.shimmer}`}/>
                    <div className={`${style.skeletonPrice} ${style.shimmer}`}/>
                </div>
            ))}
        </div>
    );
}

function GridCard({product, onOpen}) {
    const percent = discountPercent(product.price, product.oldPrice);
    const platform = shortPlatform(product.platform);

    return (
        <article className={style.card} onClick={() => onOpen?.(product)}>
            <div
                className={style.cover}
                style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
            >
                <div className={style.tags}>
                    {platform ? <span className={style.tag}>{platform}</span> : null}
                    {product.typeLabel ? <span className={style.tag}>{product.typeLabel}</span> : null}
                </div>

                {percent > 0 ? <span className={style.discount}>−{percent}%</span> : null}
            </div>

            <span className={style.name}>{product.name}</span>

            <span className={style.prices}>
                <span className={style.price}>{formatPrice(product.price)}</span>
                <span className={percent > 0 ? style.oldPrice : style.oldPricePlaceholder}>
                    {percent > 0 ? formatPrice(product.oldPrice) : '—'}
                </span>
            </span>
        </article>
    );
}

export default function ProductGrid({items, onOpen}) {
    return (
        <div className={style.grid}>
            {items.map((product) => (
                <GridCard key={product.id} product={product} onOpen={onOpen}/>
            ))}
        </div>
    );
}
