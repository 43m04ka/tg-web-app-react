import React, {useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {hapticImpact} from '../../shared/lib/haptic';
import {fetchFavorites, removeFavorite} from '../../shared/api/account';
import {useAccountList} from './useAccountList';
import {formatMoney} from './orderStatus';
import {discountPercent, shortPlatform} from '../Main/catalogSections';
import style from './Account.module.scss';

const SKELETONS = ['a', 'b', 'c'];

export default function Favorites() {
    const navigate = useNavigate();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();
    const {items, error, reload, userId, setItems} = useAccountList(fetchFavorites);

    const [removing, setRemoving] = useState(null);

    const remove = useCallback(async (product) => {
        if (!userId) return;

        hapticImpact('light');
        setRemoving(product.id);

        // Убираем сразу: ждать ответа ради строки, которая заведомо исчезнет, незачем.
        // Не получилось — возвращаем товар на место и перечитываем список.
        setItems((prev) => (prev || []).filter((item) => item.id !== product.id));

        try {
            await removeFavorite(userId, product.id);
        } catch (removeError) {
            console.error('[favorites] remove:', removeError.message);
            reload();
        } finally {
            setRemoving(null);
        }
    }, [userId, setItems, reload]);

    return (
        <div
            className={style.screen}
            style={{
                paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`,
                paddingBottom: `calc(${safeAreaInset.bottom}px + 24 * var(--u))`
            }}
        >
            <h1 className={style.title}>Избранное</h1>

            {items === null ? (
                <div className={style.list}>
                    {SKELETONS.map((key) => (
                        <div key={key} className={`${style.skeletonRow} ${style.shimmer}`} aria-hidden="true"/>
                    ))}
                </div>
            ) : error ? (
                <div className={style.empty}>
                    <p className={style.emptyText}>Не удалось загрузить избранное</p>
                    <button type="button" className={style.retry} onClick={reload}>Повторить</button>
                </div>
            ) : items.length === 0 ? (
                <div className={style.empty}>
                    <p className={style.emptyText}>В избранном пока пусто</p>
                    <button type="button" className={style.retry} onClick={() => navigate('/main')}>
                        Открыть главную
                    </button>
                </div>
            ) : (
                <div className={style.list}>
                    {items.map((product) => {
                        const percent = discountPercent(product.price, product.oldPrice);
                        const platform = shortPlatform(product.platform);

                        return (
                            <article key={product.id} className={style.favorite}>
                                <span
                                    className={style.cover}
                                    style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                                    onClick={() => navigate(`/card/${product.id}`)}
                                />

                                <span className={style.favoriteBody} onClick={() => navigate(`/card/${product.id}`)}>
                                    <span className={style.favoriteName}>{product.name}</span>
                                    <span className={style.orderMeta}>
                                        {[platform, product.typeLabel].filter(Boolean).join(' · ')}
                                    </span>
                                    <span className={style.favoritePrices}>
                                        <span className={style.price}>{formatMoney(product.price)}</span>
                                        {percent > 0 ? (
                                            <span className={style.oldPrice}>{formatMoney(product.oldPrice)}</span>
                                        ) : null}
                                    </span>
                                </span>

                                <button type="button" className={style.remove}
                                        disabled={removing === product.id}
                                        aria-label="Убрать из избранного"
                                        onClick={() => remove(product)}>
                                    ✕
                                </button>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
