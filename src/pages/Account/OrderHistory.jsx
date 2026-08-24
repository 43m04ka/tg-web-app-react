import React, {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {useInfiniteList} from '../../shared/hooks/useInfiniteList';
import {hapticImpact} from '../../shared/lib/haptic';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import {fetchOrderHistory} from '../../shared/api/account';
import {useAccountList} from './useAccountList';
import PageHeader from './PageHeader';
import {
    formatMoney,
    formatOrderDate,
    isOpenOrder,
    isSteamOrder,
    orderCoverLetter,
    orderNumber,
    orderTitle,
    positionMeta,
    statusOf
} from './orderStatus';
import style from './Account.module.scss';

const SKELETONS = ['a', 'b', 'c'];

const FILTERS = [
    {key: 'all', label: 'Все'},
    {key: 'open', label: 'В работе'},
    {key: 'done', label: 'Выполнены'}
];

export default function OrderHistory() {
    const navigate = useNavigate();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();
    const {items, error, reload} = useAccountList(fetchOrderHistory);

    const [filter, setFilter] = useState('all');

    const filtered = useMemo(() => {
        if (!items) return null;
        if (filter === 'all') return items;
        return items.filter((order) => (filter === 'open' ? isOpenOrder(order) : !isOpenOrder(order)));
    }, [items, filter]);

    const {visible, hasMore, rootRef, sentinelRef} = useInfiniteList(filtered);

    return (
        <div
            ref={rootRef}
            className={style.screen}
            style={{
                paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`,
                paddingBottom: `calc(${safeAreaInset.bottom}px + 24 * var(--u))`
            }}
        >
            <PageHeader title="Мои заказы"/>

            {items?.length ? (
                <div className={style.filters}>
                    {FILTERS.map((option) => (
                        <button key={option.key} type="button"
                                className={`${style.chip} ${filter === option.key ? style.chipActive : ''}`}
                                onClick={() => {
                                    hapticImpact('light');
                                    setFilter(option.key);
                                }}>
                            {option.label}
                        </button>
                    ))}
                </div>
            ) : null}

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
                    text="Заказы на месте — не дошёл запрос. Попробуйте ещё раз."
                    actionLabel="Повторить"
                    onAction={reload}
                />
            ) : items.length === 0 ? (
                <EmptyState
                    icon="🎮"
                    title="Заказов пока нет"
                    text="Здесь появятся ваши покупки: ключи, подписки и пополнения — все сразу после оплаты."
                    actionLabel="Перейти к играм"
                    onAction={() => navigate('/main')}
                />
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon="🔎"
                    title={filter === 'open' ? 'Активных заказов нет' : 'Выполненных заказов нет'}
                    text="Переключите фильтр, чтобы увидеть остальные."
                    actionLabel="Показать все"
                    onAction={() => setFilter('all')}
                />
            ) : (
                <div className={style.list}>
                    {visible.map((order) => {
                        const status = statusOf(order);
                        const isSteam = isSteamOrder(order);

                        return (
                            <article key={order.id} className={style.order}>
                                <div className={style.orderHead}>
                                    <span className={`${style.status} ${style[status.tone]}`}>{status.label}</span>
                                    <span className={style.orderNumber}>
                                        {orderNumber(order)} · {formatOrderDate(order.createdAt)}
                                    </span>
                                </div>

                                <div className={style.orderRow}>
                                    <span className={`${style.orderCover} ${isSteam ? style.steamCover : ''}`}>
                                        {orderCoverLetter(order)}
                                    </span>

                                    <span className={style.orderBody}>
                                        <span className={style.orderTitle}>{orderTitle(order)}</span>
                                        <span className={style.orderMeta}>{positionMeta(order)}</span>
                                    </span>

                                    <span className={style.orderTotal}>{formatMoney(order.total)}</span>
                                </div>

                                {status.tone === 'wait' && order.paymentUrl ? (
                                    <button type="button" className={style.pay}
                                            onClick={() => {
                                                hapticImpact('medium');
                                                window.open(order.paymentUrl, '_blank', 'noopener');
                                            }}>
                                        Оплатить {formatMoney(order.total)}
                                    </button>
                                ) : null}
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
