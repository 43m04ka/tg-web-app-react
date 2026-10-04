import React from 'react';
import {formatPrice} from '../Main/catalogSections';
import style from './Product.module.scss';

const PAIR_LIMIT = 2;

export default function ProductEditions({editions, activeId, onSelect}) {
    if (editions.length < 2) return null;

    const isPair = editions.length <= PAIR_LIMIT;

    return (
        <section className={style.section}>
            <div className={style.sectionHead}>
                <h2 className={style.sectionTitle}>Издание</h2>
            </div>

            <div className={isPair ? style.editionsPair : style.editionsList}>
                {editions.map(({product, label}) => {
                    const isActive = product.id === activeId;

                    if (isPair) {
                        return (
                            <button
                                key={product.id}
                                type="button"
                                className={`${style.edition} ${isActive ? style.editionActive : ''}`}
                                onClick={() => onSelect(product)}
                                aria-pressed={isActive}
                            >
                                <span className={style.editionName}>{label}</span>
                                <span className={style.editionPrice}>{formatPrice(product.price)}</span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={product.id}
                            type="button"
                            className={`${style.editionRow} ${isActive ? style.editionRowActive : ''}`}
                            onClick={() => onSelect(product)}
                            aria-pressed={isActive}
                        >
                            <span className={style.editionRadio} aria-hidden="true"/>

                            <span
                                className={style.addonCover}
                                style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                                aria-hidden="true"
                            />

                            <span className={style.addonBody}>
                                <span className={style.addonName}>{label}</span>
                            </span>

                            <span className={style.addonPrice}>{formatPrice(product.price)}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
