import React, {useEffect} from 'react';
import {createPortal} from 'react-dom';
import {discountPercent, formatPrice} from '../../../pages/Main/catalogSections';
import style from './OfferSplit.module.scss';

export default function OfferSplit({offer, onPick, onClose}) {
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    if (!offer) return null;

    const best = offer.origins[0]?.price ?? null;

    return createPortal(
        <div className={style.overlay} onClick={onClose} role="dialog" aria-modal="true">
            <div className={style.stage} onClick={(event) => event.stopPropagation()}>
                <header className={style.head}>
                    <span className={style.title}>{offer.product.name}</span>
                    <span className={style.note}>Одна игра на разных витринах — выберите свою</span>
                </header>

                <div className={style.cards}>
                    {offer.origins.map((origin, index) => {
                        const product = origin.product || offer.product;
                        const percent = discountPercent(product.price, product.oldPrice);
                        const isBest = origin.price !== null && origin.price === best;

                        return (
                            <button
                                key={origin.pageId}
                                type="button"
                                className={`${style.card} ${isBest ? style.cardBest : ''}`}
                                style={{'--i': index, '--from': `${(index - (offer.origins.length - 1) / 2) * -34}px`}}
                                onClick={() => onPick(origin)}
                            >
                                <span
                                    className={style.cover}
                                    style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                                >
                                    {percent > 0 ? <span className={style.discount}>−{percent}%</span> : null}
                                </span>

                                <span className={style.region}>
                                    {origin.icon ? (
                                        <span
                                            className={style.regionIcon}
                                            style={{backgroundImage: `url(${origin.icon})`}}
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                    {origin.label}
                                </span>

                                <span className={style.price}>{formatPrice(origin.price ?? product.price)}</span>

                                {isBest && offer.origins.length > 1 ? (
                                    <span className={style.badge}>Выгоднее</span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>

                <button type="button" className={style.close} onClick={onClose}>Закрыть</button>
            </div>
        </div>,
        document.body
    );
}
