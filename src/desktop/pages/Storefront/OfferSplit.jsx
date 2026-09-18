import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {discountPercent, formatPrice} from '../../../pages/Main/catalogSections';
import {useScrollArea} from '../../shell/ScrollAreaContext';
import Cover from '../../ui/Cover';
import style from './OfferSplit.module.scss';

const EXIT_MS = 190;

export default function OfferSplit({offer, onPick, onClose}) {
    const areaRef = useScrollArea();

    const [shown, setShown] = useState(offer);
    const [isLeaving, setLeaving] = useState(false);

    const timerRef = useRef(null);

    useEffect(() => {
        if (offer) {
            clearTimeout(timerRef.current);
            setShown(offer);
            setLeaving(false);
        }
    }, [offer]);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const leave = useCallback((done) => {
        setLeaving(true);
        clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            setShown(null);
            setLeaving(false);
            done();
        }, EXIT_MS);
    }, []);

    const close = useCallback(() => leave(onClose), [leave, onClose]);

    const pick = useCallback((origin) => {
        clearTimeout(timerRef.current);
        setShown(null);
        setLeaving(false);
        onPick(origin);
    }, [onPick]);

    useEffect(() => {
        if (!shown) return undefined;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') close();
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [shown, close]);

    useEffect(() => {
        const node = areaRef?.current;
        if (!node || !shown) return undefined;

        const previous = node.style.overflowY;
        node.style.overflowY = 'hidden';

        return () => {
            node.style.overflowY = previous;
        };
    }, [areaRef, shown]);

    if (!shown) return null;

    const best = shown.origins[0]?.price ?? null;

    return createPortal(
        <div
            className={isLeaving ? `${style.overlay} ${style.overlayOut}` : style.overlay}
            onClick={close}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={isLeaving ? `${style.stage} ${style.stageOut}` : style.stage}
                onClick={(event) => event.stopPropagation()}
            >
                <header className={style.head}>
                    <span className={style.title}>{shown.product.name}</span>
                    <span className={style.note}>Одна игра на разных витринах — выберите свою</span>
                </header>

                <div className={style.cards}>
                    {shown.origins.map((origin, index) => {
                        const product = origin.product || shown.product;
                        const percent = discountPercent(product.price, product.oldPrice);
                        const isBest = origin.price !== null && origin.price === best;

                        return (
                            <button
                                key={origin.pageId}
                                type="button"
                                className={isBest ? `${style.card} ${style.cardBest}` : style.card}
                                style={{
                                    '--i': index,
                                    '--from': `${(index - (shown.origins.length - 1) / 2) * -34}px`
                                }}
                                onClick={() => pick(origin)}
                            >
                                <Cover src={product.image} className={style.cover}>
                                    {percent > 0 ? <span className={style.discount}>−{percent}%</span> : null}
                                </Cover>

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

                                {isBest && shown.origins.length > 1 ? (
                                    <span className={style.badge}>Выгоднее</span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>

                <button type="button" className={style.close} onClick={close}>Закрыть</button>
            </div>
        </div>,
        document.body
    );
}
