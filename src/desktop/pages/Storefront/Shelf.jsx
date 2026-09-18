import React, {useState} from 'react';
import OfferCard from './OfferCard';
import style from './Storefront.module.scss';

export default function Shelf({shelf, size, showOrigin, onOpen, onOpenCatalog}) {
    const [isOpen, setOpen] = useState(false);

    const hasMore = shelf.offers.length > size;
    const visible = isOpen ? shelf.offers : shelf.offers.slice(0, size);
    const catalogPath = shelf.pages.length === 1 ? shelf.pages[0] : null;

    const action = catalogPath
        ? () => onOpenCatalog?.(catalogPath)
        : () => setOpen((open) => !open);

    return (
        <section className={style.shelf}>
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

                {catalogPath || hasMore ? (
                    <button type="button" className={style.shelfAction} onClick={action}>
                        {catalogPath ? 'Смотреть все →' : (isOpen ? 'Свернуть' : `Показать все · ${shelf.offers.length}`)}
                    </button>
                ) : null}
            </header>

            <div className={style.grid}>
                {visible.map((offer) => (
                    <OfferCard key={offer.key} offer={offer} showOrigin={showOrigin} onOpen={onOpen}/>
                ))}
            </div>
        </section>
    );
}
