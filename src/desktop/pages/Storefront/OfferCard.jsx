import React from 'react';
import {discountPercent, formatPrice, shortPlatform, subscriptionTerm} from '../../../pages/Main/catalogSections';
import {releaseInfo} from '../../../pages/Product/productView';
import Cover from '../../ui/Cover';
import style from './Storefront.module.scss';

export default function OfferCard({
    offer,
    onOpen,
    showOrigin = true,
    showAlso = true,
    showRelease = false,
    index = 0
}) {
    const {product, price, oldPrice, origins} = offer;

    const percent = discountPercent(price, oldPrice);
    const platform = shortPlatform(product.platform);
    const term = subscriptionTerm(product);
    const origin = origins[0] || null;
    const alsoIn = origins.length - 1;
    const release = showRelease ? releaseInfo(product) : null;
    const preOrder = release?.isPreOrder ? release.label : null;

    return (
        <article className={style.card} style={{'--i': index}} onClick={() => onOpen?.(offer)}>
            <Cover src={product.image} className={style.cover}>
                {preOrder ? <span className={style.release}>Выход {preOrder}</span> : null}

                {showOrigin && origin ? (
                    <span className={style.originBadge}>
                        {origin.icon ? (
                            <span
                                className={style.originIcon}
                                style={{backgroundImage: `url(${origin.icon})`}}
                                aria-hidden="true"
                            />
                        ) : null}
                        {origin.label}
                    </span>
                ) : null}

                {term ? <span className={style.term}>{term}</span> : null}
                {platform ? <span className={style.platform}>{platform}</span> : null}

                {alsoIn > 0 ? (
                    <span className={style.splitHint}>Выбрать витрину · {origins.length}</span>
                ) : null}
            </Cover>

            <span className={style.name}>{product.name}</span>

            <span className={style.prices}>
                <span className={style.price}>
                    {alsoIn > 0 ? <span className={style.from}>от </span> : null}
                    {formatPrice(price)}
                </span>
                {percent > 0 ? <span className={style.discount}>−{percent}%</span> : null}
            </span>

            {percent > 0 && oldPrice ? (
                <span className={style.oldPrice}>{formatPrice(oldPrice)}</span>
            ) : null}

            {showAlso && alsoIn > 0 ? (
                <span className={style.alsoIn}>
                    {alsoIn === 1 ? `Ещё на ${origins[1].label}` : `Ещё на ${alsoIn} витринах`}
                </span>
            ) : null}
        </article>
    );
}
