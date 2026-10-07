import React, {useMemo, useState} from 'react';
import {useReveal} from '../../shell/useReveal';
import {FlagIcon} from '../../shell/DesktopIcons';
import {SHELF_SORTS, filterOffers, shelfFilters, sortOffers} from '../../model/storefrontModel';
import SelectMenu from '../../ui/SelectMenu';
import OfferCard from './OfferCard';
import style from './Storefront.module.scss';

export default function Shelf({shelf, size, showOrigin, withFilters = false, onOpen, onOpenCatalog}) {
    const [isOpen, setOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sorting, setSorting] = useState('default');
    const ref = useReveal();

    const filters = useMemo(() => (withFilters ? shelfFilters(shelf.offers) : []), [withFilters, shelf.offers]);

    const offers = useMemo(
        () => (withFilters ? sortOffers(filterOffers(shelf.offers, filter), sorting) : shelf.offers),
        [withFilters, shelf.offers, filter, sorting]
    );

    const hasMore = offers.length > size;
    const visible = isOpen ? offers : offers.slice(0, size);
    const singlePage = shelf.pages.length === 1 ? shelf.pages[0] : null;

    const action = singlePage
        ? () => onOpenCatalog?.(singlePage)
        : () => setOpen((open) => !open);

    return (
        <section className={style.shelf} ref={ref} data-reveal="out">
            {withFilters ? (
                <div className={style.filterBar}>
                    <div className={style.filterChips}>
                        {[{key: 'all', label: 'Все платформы'}, ...filters].map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                className={item.key === filter ? `${style.filterChip} ${style.filterChipOn}` : style.filterChip}
                                onClick={() => setFilter(item.key)}
                            >
                                {item.flag ? <FlagIcon className={style.originFlag} code={item.flag} aria-hidden="true"/> : null}
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <SelectMenu options={SHELF_SORTS} value={sorting} onChange={setSorting} label="Сортировка"/>
                </div>
            ) : null}

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
                                {`Показать все · ${offers.length}`}
                                <span className={style.shelfArrow} aria-hidden="true">→</span>
                            </>
                        )}
                    </button>
                ) : null}
            </header>

            {withFilters && !offers.length ? (
                <p className={style.shelfEmpty}>Под этот фильтр в подборке ничего нет</p>
            ) : null}

            <div key={`${filter}:${sorting}`} className={style.grid}>
                {visible.map((offer, index) => (
                    <OfferCard
                        key={offer.key}
                        offer={offer}
                        index={index < size ? index : index - size}
                        showOrigin={showOrigin}
                        showRelease
                        onOpen={onOpen}
                    />
                ))}
            </div>
        </section>
    );
}
