import React from 'react';
import {discountPercent, formatPrice} from '../Main/catalogSections';
import style from './PopularRail.module.scss';

export default function PopularRail({items, onOpen}) {
    if (!items.length) return null;

    return (
        <section className={style.rail}>
            <div className={style.head}>
                <span className={style.title}>Популярное</span>
                <span className={style.note}>Хиты со всех витрин</span>
            </div>

            <div className={style.row}>
                {items.map(({id, product}) => {
                    const percent = discountPercent(product.price, product.oldPrice);

                    return (
                        <article key={id} className={style.card} onClick={() => onOpen(product)}>
                            <span
                                className={style.cover}
                                style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                            >
                                {product.typeLabel ? (
                                    <span className={style.tag}>{product.typeLabel}</span>
                                ) : null}
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
