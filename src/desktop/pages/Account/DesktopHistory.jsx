import React, {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import EmptyState from '../../../shared/ui/EmptyState/EmptyState';
import {fetchOrderHistory} from '../../../shared/api/account';
import {rupees} from '../../../pages/Basket/cartModel';
import {useAccountList} from '../../../pages/Account/useAccountList';
import {
    formatMoney,
    formatOrderDate,
    isOpenOrder,
    isSteamOrder,
    orderCoverLetter,
    orderItems,
    orderNumber,
    orderTitle,
    orderTopup,
    positionMeta,
    statusOf
} from '../../../pages/Account/orderStatus';
import {useScrollMemory} from '../../shell/ScrollAreaContext';
import BackLink from '../../ui/BackLink';
import style from './DesktopAccount.module.scss';

const SKELETONS = ['a', 'b', 'c'];

const FILTERS = [
    {key: 'all', label: 'Все'},
    {key: 'open', label: 'В работе'},
    {key: 'done', label: 'Выполнены'}
];

export default function DesktopHistory() {
    const navigate = useNavigate();
    const {items, error, reload} = useAccountList(fetchOrderHistory);

    const [filter, setFilter] = useState('all');

    const filtered = useMemo(() => {
        if (!items) return null;
        if (filter === 'all') return items;
        return items.filter((order) => (filter === 'open' ? isOpenOrder(order) : !isOpenOrder(order)));
    }, [items, filter]);

    useScrollMemory(`history:${filter}`, {ready: items !== null});

    return (
        <div className={style.screen}>
            <BackLink to="/more" label="В профиль"/>

            <header className={style.head}>
                <h1 className={style.title}>Мои заказы</h1>
                {items?.length ? <span className={style.note}>{items.length}</span> : null}
            </header>

            {items?.length ? (
                <div className={style.filters}>
                    {FILTERS.map((option) => (
                        <button
                            key={option.key}
                            type="button"
                            className={filter === option.key ? `${style.chip} ${style.chipActive}` : style.chip}
                            onClick={() => setFilter(option.key)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            ) : null}

            {items === null ? (
                <div className={style.orders}>
                    {SKELETONS.map((key, index) => (
                        <div key={key} className={style.skeletonOrder} style={{'--i': index}} aria-hidden="true"/>
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
                    onAction={() => navigate('/')}
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
                <div key={filter} className={style.orders}>
                    {filtered.map((order, index) => {
                        const status = statusOf(order);
                        const isSteam = isSteamOrder(order);
                        const positions = isSteam ? [] : orderItems(order);
                        const topup = orderTopup(order);

                        return (
                            <article key={order.id} className={style.order} style={{'--i': index}}>
                                <div className={style.orderHead}>
                                    <span className={`${style.status} ${style[status.tone]}`}>{status.label}</span>
                                    <span className={style.orderNumber}>
                                        {[orderNumber(order), formatOrderDate(order.createdAt)]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </span>
                                </div>

                                <div className={style.orderRow}>
                                    <span
                                        className={isSteam
                                            ? `${style.orderCover} ${style.steamCover}`
                                            : style.orderCover}
                                    >
                                        {orderCoverLetter(order)}
                                    </span>

                                    <span className={style.orderBody}>
                                        <span className={style.orderTitle}>{orderTitle(order)}</span>
                                        <span className={style.orderMeta}>{positionMeta(order)}</span>
                                    </span>

                                    <span className={style.orderTotal}>{formatMoney(order.total)}</span>
                                </div>

                                {positions.length > 1 ? (
                                    <ul className={style.orderItems}>
                                        {positions.map((item, itemIndex) => (
                                            <li key={`${item.name}-${itemIndex}`} className={style.orderItem}>
                                                <span className={style.orderItemName}>{item.name}</span>
                                                {item.quantity > 1 ? (
                                                    <span className={style.orderItemCount}>×{item.quantity}</span>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}

                                {topup?.meta?.leftoverRs > 0 ? (
                                    <span className={style.orderNote}>
                                        Остаток {rupees(topup.meta.leftoverRs)} сохранится на балансе аккаунта
                                    </span>
                                ) : null}

                                {status.tone === 'wait' && order.paymentUrl ? (
                                    <button
                                        type="button"
                                        className={style.pay}
                                        onClick={() => window.open(order.paymentUrl, '_blank', 'noopener')}
                                    >
                                        Оплатить {formatMoney(order.total)}
                                    </button>
                                ) : null}
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
