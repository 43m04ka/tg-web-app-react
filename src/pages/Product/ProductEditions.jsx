import React from 'react';
import {formatPrice} from '../Main/catalogSections';
import style from './Product.module.scss';

export default function ProductEditions({editions, activeId, onSelect}) {
    if (editions.length < 2) return null;

    const active = editions.find((edition) => edition.product.id === activeId);

    return (
        <section className={style.section}>
            <div className={style.sectionHead}>
                <h2 className={style.sectionTitle}>Издание</h2>
                {active ? <span className={style.sectionNote}>{active.label}</span> : null}
            </div>

            <div className={style.editions}>
                {editions.map(({product, label}) => {
                    const isActive = product.id === activeId;

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
                })}
            </div>
        </section>
    );
}
