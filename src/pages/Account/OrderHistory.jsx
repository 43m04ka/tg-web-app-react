import React from 'react';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {fetchOrderHistory} from '../../shared/api/account';
import {useAccountList} from './useAccountList';
import {formatMoney, formatOrderDate, orderTitle, statusOf} from './orderStatus';
import style from './Account.module.scss';

const SKELETONS = ['a', 'b', 'c'];

export default function OrderHistory() {
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();
    const {items, error, reload} = useAccountList(fetchOrderHistory);

    return (
        <div
            className={style.screen}
            style={{
                paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`,
                paddingBottom: `calc(${safeAreaInset.bottom}px + 24 * var(--u))`
            }}
        >
            <h1 className={style.title}>Мои заказы</h1>

            {items === null ? (
                <div className={style.list}>
                    {SKELETONS.map((key) => (
                        <div key={key} className={`${style.skeletonRow} ${style.shimmer}`} aria-hidden="true"/>
                    ))}
                </div>
            ) : error ? (
                <div className={style.empty}>
                    <p className={style.emptyText}>Не удалось загрузить заказы</p>
                    <button type="button" className={style.retry} onClick={reload}>Повторить</button>
                </div>
            ) : items.length === 0 ? (
                <div className={style.empty}>
                    <p className={style.emptyText}>Заказов пока нет</p>
                </div>
            ) : (
                <div className={style.list}>
                    {items.map((order) => {
                        const status = statusOf(order);
                        const date = formatOrderDate(order.createdAt);
                        const total = formatMoney(order.total);

                        return (
                            <article key={order.id} className={style.order}>
                                <span className={style.orderBody}>
                                    <span className={style.orderTitle}>{orderTitle(order)}</span>
                                    <span className={style.orderMeta}>
                                        {[date, total].filter(Boolean).join(' · ')}
                                    </span>
                                </span>
                                <span className={`${style.status} ${style[status.tone]}`}>{status.label}</span>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
