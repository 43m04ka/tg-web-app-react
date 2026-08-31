import React, {useEffect, useRef} from 'react';
import {formatPrice} from '../Main/catalogSections';
import style from './Product.module.scss';

const FIT_LIMIT = 3;

export default function ProductEditions({editions, activeId, onSelect}) {
    const trackRef = useRef(null);

    const isScrollable = editions.length > FIT_LIMIT;

    useEffect(() => {
        if (!isScrollable) return;

        const track = trackRef.current;
        const active = track?.querySelector('[data-active="true"]');
        if (!track || !active) return;

        const left = active.offsetLeft - track.offsetLeft
            - (track.clientWidth - active.clientWidth) / 2;

        if (typeof track.scrollTo === 'function') track.scrollTo({left, behavior: 'smooth'});
        else track.scrollLeft = left;
    }, [activeId, isScrollable]);

    if (editions.length < 2) return null;

    const active = editions.find((edition) => edition.product.id === activeId);

    return (
        <section className={style.section}>
            <div className={style.sectionHead}>
                <h2 className={style.sectionTitle}>Издание</h2>
                {active ? <span className={style.sectionNote}>{active.label}</span> : null}
            </div>

            <div
                ref={trackRef}
                className={`${style.editions} ${isScrollable ? style.editionsScroll : style.editionsFit}`}
            >
                {editions.map(({product, label}) => {
                    const isActive = product.id === activeId;

                    return (
                        <button
                            key={product.id}
                            type="button"
                            data-active={isActive}
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
