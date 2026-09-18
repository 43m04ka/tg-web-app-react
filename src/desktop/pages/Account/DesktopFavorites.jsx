import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import EmptyState from '../../../shared/ui/EmptyState/EmptyState';
import {fetchFavorites} from '../../../shared/api/account';
import {useFavoriteStore} from '../../../store/useFavoriteStore';
import {useProductStore} from '../../../store/useProductStore';
import {useStructureStore} from '../../../store/useStructureStore';
import {productRoute} from '../../../shared/lib/pageRoutes';
import {useAccountList} from '../../../pages/Account/useAccountList';
import {formatMoney} from '../../../pages/Account/orderStatus';
import {discountPercent, shortPlatform} from '../../../pages/Main/catalogSections';
import {useScrollMemory} from '../../shell/ScrollAreaContext';
import Cover from '../../ui/Cover';
import style from './DesktopAccount.module.scss';

const SKELETONS = ['a', 'b', 'c', 'd', 'e', 'f'];

const plural = (count) => {
    const tail = count % 10;
    const hundred = count % 100;
    if (tail === 1 && hundred !== 11) return 'товар';
    if (tail >= 2 && tail <= 4 && (hundred < 12 || hundred > 14)) return 'товара';
    return 'товаров';
};

export default function DesktopFavorites() {
    const navigate = useNavigate();
    const catalogs = useStructureStore((state) => state.catalogs);

    const {items, error, reload, userId, setItems} = useAccountList(fetchFavorites);

    const setFavorite = useFavoriteStore((state) => state.setFavorite);
    const rememberPreviews = useProductStore((state) => state.rememberPreviews);

    const [leavingId, setLeavingId] = useState(null);

    useScrollMemory('favorites', {ready: items !== null});

    useEffect(() => {
        rememberPreviews(items);
    }, [items, rememberPreviews]);

    const openProduct = useCallback(
        (product) => navigate(productRoute(product, catalogs) || `/card/${product.id}`),
        [navigate, catalogs]
    );

    const remove = useCallback((product) => {
        if (!userId || leavingId) return;

        setLeavingId(product.id);

        setFavorite(userId, product.id, false)
            .then((isDone) => {
                if (!isDone) reload();
            })
            .catch(() => reload());
    }, [userId, leavingId, setFavorite, reload]);

    const dropLeaving = useCallback((event, product) => {
        if (event.target !== event.currentTarget) return;

        setItems((prev) => (prev || []).filter((item) => item.id !== product.id));
        setLeavingId(null);
    }, [setItems]);

    const count = items?.length ?? 0;

    return (
        <div className={style.screen}>
            <header className={style.head}>
                <h1 className={style.title}>Избранное</h1>
                {count ? <span className={style.note}>{count} {plural(count)}</span> : null}
            </header>

            {items === null ? (
                <div className={style.grid}>
                    {SKELETONS.map((key, index) => (
                        <div key={key} className={style.skeletonCard} style={{'--i': index}} aria-hidden="true"/>
                    ))}
                </div>
            ) : error ? (
                <EmptyState
                    tone="danger"
                    icon="⚠"
                    title="Не удалось загрузить"
                    text="Проверьте связь и попробуйте ещё раз — избранное никуда не делось."
                    actionLabel="Повторить"
                    onAction={reload}
                />
            ) : count === 0 ? (
                <EmptyState
                    icon="♡"
                    title="В избранном пусто"
                    text="Нажимайте на сердечко у товара — он появится здесь, а мы сообщим, когда на него упадёт цена."
                    actionLabel="Выбрать игру"
                    onAction={() => navigate('/')}
                />
            ) : (
                <div className={style.grid}>
                    {items.map((product, index) => {
                        const percent = discountPercent(product.price, product.oldPrice);
                        const meta = [shortPlatform(product.platform), product.typeLabel, product.regionActivate]
                            .filter(Boolean)
                            .join(' · ');

                        const isLeaving = leavingId === product.id;

                        return (
                            <article
                                key={product.id}
                                className={isLeaving ? `${style.favorite} ${style.favoriteLeaving}` : style.favorite}
                                style={{'--i': index}}
                                onAnimationEnd={isLeaving ? (event) => dropLeaving(event, product) : undefined}
                            >
                                <Cover
                                    src={product.image}
                                    className={style.favoriteCover}
                                    onClick={() => openProduct(product)}
                                >
                                    <button
                                        type="button"
                                        className={style.heart}
                                        disabled={isLeaving}
                                        aria-label="Убрать из избранного"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            remove(product);
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <path
                                                d="M12 20.4 4.6 13a4.8 4.8 0 0 1 6.8-6.8l.6.6.6-.6A4.8 4.8 0 0 1 19.4 13Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </button>

                                    {percent > 0 ? (
                                        <span className={style.discount}>−{percent}%</span>
                                    ) : null}
                                </Cover>

                                <span className={style.favoriteName} onClick={() => openProduct(product)}>
                                    {product.name}
                                </span>

                                {meta ? <span className={style.favoriteMeta}>{meta}</span> : null}

                                <span className={style.favoritePrices}>
                                    <span className={style.price}>{formatMoney(product.price)}</span>
                                    {percent > 0 ? (
                                        <span className={style.oldPrice}>{formatMoney(product.oldPrice)}</span>
                                    ) : null}
                                </span>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
