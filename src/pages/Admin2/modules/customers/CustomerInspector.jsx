import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Badge,
    Button,
    ButtonRow,
    EmptyState,
    Inspector,
    InspectorRows,
    InspectorSection,
    Money,
    Mono,
    Note,
    Time
} from '../../ui';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import {statusTitle, statusTone} from '../orders/model';
import {fetchCustomer} from './api';
import {
    PLATFORM_TITLES,
    conversionTitle,
    customerTitle,
    dayTitle,
    loyaltyTitle,
    loyaltyTone,
    moneyTitle
} from './customersModel';
import style from './CustomersScreen.module.scss';

const TABS = [
    {id: 'orders', title: 'Заказы'},
    {id: 'basket', title: 'Корзина'},
    {id: 'favorites', title: 'Избранное'}
];

function Goods({items, empty}) {
    if (items.length === 0) return <EmptyState title={empty}/>;

    return (
        <div className={style.goods}>
            {items.map((item, index) => (
                <div key={`${item.id}-${index}`} className={style.good}>
                    <span
                        className={style.goodArt}
                        style={item.product?.image ? {backgroundImage: `url(${item.product.image})`} : undefined}
                    />

                    <span className={style.goodBody}>
                        <span className={style.goodName}>
                            {item.product?.name || item.name || `Товар №${item.id}`}
                        </span>

                        <span className={style.goodNote}>
                            №{item.id}
                            {item.count > 1 ? ` · ${item.count} шт` : ''}
                            {!item.product ? ' · товара больше нет' : ''}
                            {item.product && !item.product.onSale ? ' · снят с продажи' : ''}
                        </span>
                    </span>

                    <Money value={item.product?.price ?? item.price}/>
                </div>
            ))}
        </div>
    );
}

export default function CustomerInspector({id, onClose}) {
    const [tab, setTab] = useState('orders');
    const navigate = useNavigate();

    const card = useResource(keys.customer(id), () => fetchCustomer(id));

    const customer = card.data?.customer || null;
    const summary = card.data?.summary || null;
    const orders = card.data?.orders || [];
    const basket = card.data?.basket || [];
    const favorites = card.data?.favorites || [];

    return (
        <Inspector
            open
            width="m"
            title={customer ? customerTitle(customer) : 'Покупатель'}
            subtitle={customer ? PLATFORM_TITLES[customer.platform] || customer.platform : ''}
            badge={summary ? <Badge tone={loyaltyTone(summary)}>{loyaltyTitle(summary)}</Badge> : null}
            tabs={TABS}
            tab={tab}
            onTab={setTab}
            loading={card.isLoading && !card.data}
            error={card.error}
            onRetry={card.refresh}
            onClose={onClose}
            footer={(
                <ButtonRow>
                    <Button variant="danger" onClick={onClose}>Закрыть</Button>
                </ButtonRow>
            )}
        >
            <InspectorSection title="Кто это">
                <InspectorRows
                    items={[
                        {label: 'Имя', value: customer?.username ? <Mono>{customer.username}</Mono> : '—'},
                        {label: 'Чат', value: customer?.chatId ? <Mono>{customer.chatId}</Mono> : '—'},
                        {label: 'Площадка', value: PLATFORM_TITLES[customer?.platform] || customer?.platform || '—'},
                        {label: 'С нами с', value: dayTitle(customer?.createdAt)}
                    ]}
                />
            </InspectorSection>

            <InspectorSection
                title="Покупки"
                note="Потрачено считается по оплаченным и выполненным заказам: рассрочка идёт мимо кассы и в paid не попадает."
            >
                <InspectorRows
                    items={[
                        {label: 'Оформлений', value: summary?.orders ?? 0},
                        {label: 'Из них оплачено', value: summary?.paidOrders ?? 0},
                        {label: 'Доходит до оплаты', value: conversionTitle(summary)},
                        {label: 'Потрачено', value: moneyTitle(summary?.spent)},
                        {label: 'Средний чек', value: moneyTitle(summary?.averageCheck)},
                        summary?.firstAt ? {label: 'Первый заказ', value: dayTitle(summary.firstAt)} : null,
                        summary?.lastAt ? {label: 'Последний заказ', value: dayTitle(summary.lastAt)} : null
                    ]}
                />
            </InspectorSection>

            {tab === 'orders' ? (
                <InspectorSection title="Заказы" note={orders.length >= 100 ? 'Показаны последние сто.' : ''}>
                    {orders.length === 0 ? (
                        <EmptyState title="Заказов не было"/>
                    ) : (
                        <div className={style.orders}>
                            {orders.map((order) => (
                                <button
                                    key={order.id}
                                    type="button"
                                    className={style.order}
                                    onClick={() => navigate(`/admin2/orders/${order.id}`)}
                                >
                                    <Mono>{`#${order.id}`}</Mono>
                                    <Time value={order.createdAt}/>
                                    <Badge tone={statusTone(order.status)}>{statusTitle(order.status)}</Badge>
                                    <span className={style.orderTotal}><Money value={order.total}/></span>
                                </button>
                            ))}
                        </div>
                    )}
                </InspectorSection>
            ) : null}

            {tab === 'basket' ? (
                <InspectorSection
                    title="Корзина"
                    note="Брошенная корзина — повод написать: покупатель дошёл до выбора и остановился."
                >
                    <Goods items={basket} empty="Корзина пуста"/>
                </InspectorSection>
            ) : null}

            {tab === 'favorites' ? (
                <InspectorSection title="Избранное">
                    <Goods items={favorites} empty="Избранного нет"/>
                </InspectorSection>
            ) : null}

            {customer && !customer.chatId ? (
                <Note tone="warning">
                    У покупателя нет идентификатора чата: написать ему из бота не выйдет.
                </Note>
            ) : null}
        </Inspector>
    );
}
