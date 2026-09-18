import React, {useState} from 'react';
import {useReveal} from '../../shell/useReveal';
import OfferCard from './OfferCard';
import style from './Storefront.module.scss';

export default function Shelf({shelf, size, showOrigin, onOpen, onOpenCatalog}) {
    const [isOpen, setOpen] = useState(false);
    const ref = useReveal();

    const hasMore = shelf.offers.length > size;
    const visible = isOpen ? shelf.offers : shelf.offers.slice(0, size);
    const singlePage = shelf.pages.length === 1 ? shelf.pages[0] : null;

    const action = singlePage
        ? () => onOpenCatalog?.(singlePage)
        : () => setOpen((open) => !open);

    return (
        <section className={style.shelf} ref={ref} data-reveal="out">
            <header className={style.shelfHead}>
                <span className={style.shelfTitle}>
                    {shelf.icon ? (
                        <span
                            className={style.shelfIcon}
                            style={{backgroundImage: `url(${shelf.icon})`}}
                            aria-hidden="true"
                        />
                    ) : null}
                    {shelf.title}
                </span>

                {singlePage || hasMore ? (
                    <button type="button" className={style.shelfAction} onClick={action}>
                        {singlePage ? (
                            <>
                                Смотреть все
                                <span className={style.shelfArrow} aria-hidden="true">→</span>
                            </>
                        ) : isOpen ? (
                            <>
                                Свернуть
                                <span className={`${style.shelfArrow} ${style.shelfArrowUp}`} aria-hidden="true">→</span>
                            </>
                        ) : (
                            <>
                                {`Показать все · ${shelf.offers.length}`}
                                <span className={style.shelfArrow} aria-hidden="true">→</span>
                            </>
                        )}
                    </button>
                ) : null}
            </header>

            <div className={style.grid}>
                {visible.map((offer, index) => (
                    <OfferCard
                        key={offer.key}
                        offer={offer}
                        index={index < size ? index : index - size}
                        showOrigin={showOrigin}
                        onOpen={onOpen}
                    />
                ))}
            </div>
        </section>
    );
}
