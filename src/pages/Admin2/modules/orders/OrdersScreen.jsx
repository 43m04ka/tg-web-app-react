import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Badge,
    Button,
    Collection,
    Money,
    Mono,
    Select,
    Time,
    Workspace,
    useCollectionState,
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import {useResource} from '../../platform/useResource';
import {keys} from '../../platform/resources';
import {fetchOrders} from './api';
import {
    PAYOUT_TITLES,
    PAYOUT_TONES,
    PLATFORM_TITLES,
    TYPE_TITLES,
    needsAttention,
    statusTitle,
    statusTone,
} from './model';
import OrderInspector from './OrderInspector';
import style from './OrdersScreen.module.scss';

const DEFAULTS = {
    search: '',
    status: '',
    type: '',
    platform: '',
    trouble: '',
};

const STATUS_OPTIONS = [
    {value: '', title: 'Статус: любой'},
    {value: 'new', title: 'Новый'},
    {value: 'awaiting_payment', title: 'Ждёт оплаты'},
    {value: 'paid', title: 'Оплачен'},
    {value: 'payment_failed', title: 'Оплата не прошла'},
    {value: 'completed', title: 'Выполнен'},
    {value: 'canceled', title: 'Отменён'},
    {value: 'refunded', title: 'Возврат'},
];

const TYPE_OPTIONS = [
    {value: '', title: 'Тип: любой'},
    {value: 'catalog', title: 'Каталог'},
    {value: 'steam_topup', title: 'Steam'},
    {value: 'code_order', title: 'Коды'},
];

const PLATFORM_OPTIONS = [
    {value: '', title: 'Площадка: любая'},
    {value: 'tg', title: 'Telegram'},
    {value: 'web', title: 'Сайт'},
    {value: 'vk', title: 'VK'},
    {value: 'max', title: 'MAX'},
];

const TROUBLE_OPTIONS = [
    {value: '', title: 'Все заказы'},
    {value: 'yes', title: 'Требуют внимания'},
];

export default function OrdersScreen() {
    usePageHeader('Заказы');

    const navigate = useNavigate();
    const {id} = useParams();
    const {value, patch} = useCollectionState(DEFAULTS);
    const [draftSearch, setDraftSearch] = useState(value.search);

    useEffect(() => {
        setDraftSearch(value.search);
    }, [value.search]);

    useEffect(() => {
        if (draftSearch === value.search) return undefined;

        const timerId = setTimeout(() => patch({search: draftSearch}), 400);
        return () => clearTimeout(timerId);
    }, [draftSearch, value.search, patch]);

    const list = useResource(keys.orderList(value.search), () => fetchOrders(value.search), {refreshMs: 30000});

    const rows = useMemo(() => {
        const all = list.data?.result || [];

        return all
            .filter((order) => (!value.status || order.status === value.status))
            .filter((order) => (!value.type || order.type === value.type))
            .filter((order) => (!value.platform || order.platform === value.platform))
            .filter((order) => (value.trouble !== 'yes' || needsAttention(order)))
            .slice()
            .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
    }, [list.data, value]);

    const columns = useMemo(() => ([
        {
            id: 'id',
            title: 'Номер',
            width: 84,
            cell: (row) => <Mono>{`#${row.id}`}</Mono>,
        },
        {
            id: 'createdAt',
            title: 'Создан',
            width: 118,
            cell: (row) => <Time value={row.createdAt}/>,
        },
        {
            id: 'type',
            title: 'Тип',
            width: 92,
            cell: (row) => TYPE_TITLES[row.type] || row.type,
        },
        {
            id: 'platform',
            title: 'Площадка',
            width: 96,
            cell: (row) => PLATFORM_TITLES[row.platform] || row.platform,
        },
        {
            id: 'contact',
            title: 'Покупатель',
            cell: (row) => (
                <span className={style.contact}>
                    {row.contact || row.steamLogin || row.email || <span className={style.dash}>без контакта</span>}
                </span>
            ),
        },
        {
            id: 'total',
            title: 'Сумма',
            width: 112,
            align: 'right',
            cell: (row) => <Money value={row.total}/>,
        },
        {
            id: 'status',
            title: 'Статус',
            width: 132,
            cell: (row) => <Badge tone={statusTone(row.status)}>{statusTitle(row.status)}</Badge>,
        },
        {
            id: 'payout',
            title: 'Выплата',
            width: 120,
            cell: (row) => (row.type === 'steam_topup'
                ? <Badge tone={PAYOUT_TONES[row.payoutStatus] || 'neutral'}>{PAYOUT_TITLES[row.payoutStatus] || row.payoutStatus}</Badge>
                : <span className={style.dash}>—</span>),
        },
    ]), []);

    const openOrder = useCallback((row) => navigate(`/admin2/orders/${row.id}`), [navigate]);
    const closeOrder = useCallback(() => navigate('/admin2/orders'), [navigate]);

    return (
        <Workspace>
            <Collection
                columns={columns}
                rows={rows}
                loading={list.isLoading}
                stale={list.isStale}
                error={list.error}
                onRetry={list.refresh}
                activeKey={id ? Number(id) : null}
                onOpen={openOrder}
                search={{
                    value: draftSearch,
                    onChange: setDraftSearch,
                    placeholder: 'Номер заказа или дата 2026.09.01',
                }}
                filters={(
                    <>
                        <Select
                            options={STATUS_OPTIONS}
                            value={value.status}
                            onChange={(event) => patch({status: event.target.value})}
                        />
                        <Select
                            options={TYPE_OPTIONS}
                            value={value.type}
                            onChange={(event) => patch({type: event.target.value})}
                        />
                        <Select
                            options={PLATFORM_OPTIONS}
                            value={value.platform}
                            onChange={(event) => patch({platform: event.target.value})}
                        />
                        <Select
                            options={TROUBLE_OPTIONS}
                            value={value.trouble}
                            onChange={(event) => patch({trouble: event.target.value})}
                        />
                    </>
                )}
                actions={(
                    <Button size="s" variant="ghost" onClick={list.refresh}>Обновить</Button>
                )}
                empty={{
                    title: value.search ? 'По запросу ничего не найдено' : 'Заказов пока нет',
                    text: value.search
                        ? 'Сервер ищет по точному номеру заказа или по дате в виде 2026.09.01. Часть строки в поиске не работает.'
                        : 'Список наполняется покупками из бота и с сайта.',
                }}
                footNote={
                    'Сервер отдаёт последние 20 заказов либо результат поиска по номеру или дате. '
                    + 'Фильтры ниже применяются к этой выдаче; сквозные фильтры и пагинация появятся с треком B2.'
                }
            />

            {id ? <OrderInspector id={Number(id)} onClose={closeOrder}/> : null}
        </Workspace>
    );
}
