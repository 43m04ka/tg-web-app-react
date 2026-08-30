import React from 'react';
import {discountPercent, formatPrice, platformList, subscriptionTerm} from '../Main/catalogSections';
import {accentStyle} from '../SelectPlatform/accent';
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

const STAGGER_LIMIT = 8;
const STAGGER_STEP_MS = 32;

function GridCard({product, index, animate, regionOf, onOpen}) {
    const percent = discountPercent(product.price, product.oldPrice);
    const platforms = platformList(product.platform);
    const region = regionOf?.(product);
    const term = subscriptionTerm(product);
    const isAnimated = animate && index < STAGGER_LIMIT;

    return (
        <article
            className={`${style.card} ${isAnimated ? style.cardIn : ''}`}
            style={isAnimated ? {animationDelay: `${index * STAGGER_STEP_MS}ms`} : undefined}
            onClick={() => onOpen?.(product)}
        >
            <div
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

                <div className={style.tags}>
                    {platforms.map((item) => (
                        <span key={item} className={style.tag}>{item}</span>
                    ))}
                    {product.typeLabel ? <span className={style.tag}>{product.typeLabel}</span> : null}
                </div>

                {percent > 0 ? <span className={style.discount}>−{percent}%</span> : null}

                {term ? <span className={style.term}>{term}</span> : null}
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

export default function ProductGrid({items, animate = true, regionOf, onOpen}) {
    return (
        <div className={style.grid}>
            {items.map((product, index) => (
                <GridCard
                    key={product.id}
                    product={product}
                    index={index}
                    animate={animate}
                    regionOf={regionOf}
                    onOpen={onOpen}
                />
            ))}
        </div>
    );
}
