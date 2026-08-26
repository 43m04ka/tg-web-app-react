import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {useInfiniteList} from '../../shared/hooks/useInfiniteList';
import {hapticImpact} from '../../shared/lib/haptic';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import {fetchFavorites} from '../../shared/api/account';
import {useFavoriteStore} from '../../store/useFavoriteStore';
import {useProductStore} from '../../store/useProductStore';
import {useAccountList} from './useAccountList';
import PageHeader from './PageHeader';
import {formatMoney} from './orderStatus';
import {discountPercent, shortPlatform} from '../Main/catalogSections';
import style from './Account.module.scss';

const SKELETONS = ['a', 'b', 'c'];

const plural = (count) => {
    const tail = count % 10;
    const hundred = count % 100;
    if (tail === 1 && hundred !== 11) return 'товар';
    if (tail >= 2 && tail <= 4 && (hundred < 12 || hundred > 14)) return 'товара';
    return 'товаров';
};

export default function Favorites() {
    const navigate = useNavigate();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();
    const {items, error, reload, userId, setItems} = useAccountList(fetchFavorites);

    const setFavorite = useFavoriteStore((state) => state.setFavorite);
    const rememberPreviews = useProductStore((state) => state.rememberPreviews);

    const [leavingId, setLeavingId] = useState(null);

    useEffect(() => {
        rememberPreviews(items);
    }, [items, rememberPreviews]);

    const remove = useCallback((product) => {
        if (!userId || leavingId) return;

        hapticImpact('light');
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

    const {visible, hasMore, rootRef, sentinelRef} = useInfiniteList(items);

    return (
        <div
            ref={rootRef}
            className={style.screen}
            style={{
                paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`,
                paddingBottom: `calc(${safeAreaInset.bottom}px + 24 * var(--u))`
            }}
        >
            <PageHeader
                title="Избранное"
                note={items?.length ? `${count} ${plural(count)}` : null}
            />

            {items === null ? (
                <div className={style.list}>
                    {SKELETONS.map((key) => (
                        <div key={key} className={`${style.skeletonCard} ${style.shimmer}`} aria-hidden="true"/>
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
                    onAction={() => navigate('/main')}
                />
            ) : (
                <div className={style.list}>
                    {visible.map((product) => {
                        const percent = discountPercent(product.price, product.oldPrice);
                        const meta = [shortPlatform(product.platform), product.typeLabel, product.regionActivate]
                            .filter(Boolean)
                            .join(' · ');

                        const isLeaving = leavingId === product.id;

                        return (
                            <article
                                key={product.id}
                                className={`${style.favorite} ${isLeaving ? style.favoriteLeaving : ''}`}
                                onAnimationEnd={isLeaving ? (event) => dropLeaving(event, product) : undefined}
                            >
                                <span
                                    className={style.cover}
                                    style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                                    onClick={() => navigate(`/card/${product.id}`)}
                                />

                                <span className={style.favoriteBody}>
                                    <span className={style.favoriteTop}>
                                        <span className={style.favoriteName}
                                              onClick={() => navigate(`/card/${product.id}`)}>
                                            {product.name}
                                        </span>
                                        <button type="button" className={style.heart}
                                                disabled={isLeaving}
                                                aria-label="Убрать из избранного"
                                                onClick={() => remove(product)}>
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path
                                                    d="M12 20.4 4.6 13a4.8 4.8 0 0 1 6.8-6.8l.6.6.6-.6A4.8 4.8 0 0 1 19.4 13Z"
                                                    fill="currentColor"
                                                />
                                            </svg>
                                        </button>
                                    </span>

                                    {meta ? <span className={style.favoriteMeta}>{meta}</span> : null}

                                    <span className={style.favoritePrices}>
                                        <span className={style.price}>{formatMoney(product.price)}</span>

                                        {percent > 0 ? (
                                            <>
                                                <span className={style.oldPrice}>
                                                    {formatMoney(product.oldPrice)}
                                                </span>
                                                <span className={style.discount}>−{percent}%</span>
                                            </>
                                        ) : null}
                                    </span>
                                </span>
                            </article>
                        );
                    })}

                    {hasMore ? (
                        <div ref={sentinelRef} className={`${style.skeletonCard} ${style.shimmer}`} aria-hidden="true"/>
                    ) : null}
                </div>
            )}
        </div>
    );
}
