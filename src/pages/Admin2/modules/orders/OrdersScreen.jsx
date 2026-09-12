import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Badge,
    Button,
    Collection,
    Input,
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
    payoutStatus: '',
    trouble: '',
    from: '',
    to: '',
    sorting: 'newest',
    page: 1,
    pageSize: 50,
};

const SORT_OPTIONS = [
    {value: 'newest', title: 'Сначала свежие'},
    {value: 'oldest', title: 'Сначала старые'},
    {value: 'expensive', title: 'Сначала дорогие'},
    {value: 'cheap', title: 'Сначала дешёвые'},
];

const PAYOUT_OPTIONS = [
    {value: '', title: 'Выплата: любая'},
    {value: 'none', title: 'Не запускалась'},
    {value: 'processing', title: 'Идёт'},
    {value: 'success', title: 'Зачислено'},
    {value: 'error', title: 'Ошибка'},
];

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
    const {value, patch, withQuery} = useCollectionState(DEFAULTS);
    const [draftSearch, setDraftSearch] = useState(value.search);

    useEffect(() => {
        setDraftSearch(value.search);
    }, [value.search]);

    useEffect(() => {
        if (draftSearch === value.search) return undefined;

        const timerId = setTimeout(() => patch({search: draftSearch}), 400);
        return () => clearTimeout(timerId);
    }, [draftSearch, value.search, patch]);

    const query = useMemo(() => ({
        search: value.search,
        status: value.status,
        type: value.type,
        platform: value.platform,
        payoutStatus: value.payoutStatus,
        trouble: value.trouble,
        from: value.from,
        to: value.to,
        sorting: value.sorting,
        page: value.page,
        pageSize: value.pageSize,
    }), [value]);

    const list = useResource(keys.orderList(query), () => fetchOrders(query), {refreshMs: 30000});

    const data = list.data || {};
    const rows = useMemo(() => data.items || [], [data.items]);

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
            id: 'cost',
            title: 'Себестоимость',
            width: 130,
            align: 'right',
            cell: (row) => (row.cost === null || row.cost === undefined
                ? <span className={style.dash}>—</span>
                : (
                    <span className={style.cost}>
                        {row.costAuto ? <span className={style.auto}>авто</span> : null}
                        <Money value={row.cost}/>
                    </span>
                )),
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

    const openOrder = useCallback((row) => navigate(withQuery(`/admin2/orders/${row.id}`)), [navigate, withQuery]);
    const closeOrder = useCallback(() => navigate(withQuery('/admin2/orders')), [navigate, withQuery]);

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
                    placeholder: 'Номер, контакт, логин Steam, почта, номер платежа',
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
                            options={PAYOUT_OPTIONS}
                            value={value.payoutStatus}
                            onChange={(event) => patch({payoutStatus: event.target.value})}
                        />
                        <Select
                            options={TROUBLE_OPTIONS}
                            value={value.trouble}
                            onChange={(event) => patch({trouble: event.target.value})}
                        />
                        <Select
                            options={SORT_OPTIONS}
                            value={value.sorting}
                            onChange={(event) => patch({sorting: event.target.value})}
                        />
                        <Input
                            type="date"
                            value={value.from}
                            title="Заказы с этого дня"
                            onChange={(event) => patch({from: event.target.value})}
                        />
                        <Input
                            type="date"
                            value={value.to}
                            title="Заказы по этот день включительно"
                            onChange={(event) => patch({to: event.target.value})}
                        />
                    </>
                )}
                actions={(
                    <Button size="s" variant="ghost" onClick={list.refresh}>Обновить</Button>
                )}
                pagination={{
                    page: data.page || value.page,
                    pages: data.pages || 1,
                    total: data.total,
                    pageSize: data.pageSize || value.pageSize,
                    onPage: (page) => patch({page}, {keepPage: true}),
                    onPageSize: (pageSize) => patch({pageSize, page: 1}, {keepPage: true}),
                }}
                empty={{
                    title: data.activeFilters ? 'Под фильтры ничего не подошло' : 'Заказов пока нет',
                    text: data.activeFilters
                        ? 'Поиск идёт по контакту, логину Steam, почте, номеру платежа и промокоду. Номер заказа — только целиком.'
                        : 'Список наполняется покупками из бота и с сайта.',
                }}
            />

            {id ? <OrderInspector id={Number(id)} onClose={closeOrder}/> : null}
        </Workspace>
    );
}
