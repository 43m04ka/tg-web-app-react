import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Badge, Button, Collection, Mono, Select, Time, Workspace, useCollectionState} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import {fetchCustomers} from './api';
import {PLATFORM_OPTIONS, PLATFORM_TITLES, SORT_OPTIONS, customerTitle} from './customersModel';
import CustomerInspector from './CustomerInspector';
import style from './CustomersScreen.module.scss';

const DEFAULTS = {
    search: '',
    platform: '',
    sorting: 'newest',
    page: 1,
    pageSize: 50
};

export default function CustomersScreen() {
    usePageHeader('Покупатели');

    const navigate = useNavigate();
    const {id} = useParams();
    const {value, patch} = useCollectionState(DEFAULTS);

    const [draftSearch, setDraftSearch] = useState(value.search);

    useEffect(() => {
        setDraftSearch(value.search);
    }, [value.search]);

    useEffect(() => {
        if (draftSearch === value.search) return undefined;

        const timerId = setTimeout(() => patch({search: draftSearch, page: 1}), 400);
        return () => clearTimeout(timerId);
    }, [draftSearch, value.search, patch]);

    const query = useMemo(() => ({
        search: value.search,
        platform: value.platform,
        sorting: value.sorting,
        page: value.page,
        pageSize: value.pageSize
    }), [value]);

    const list = useResource(keys.customerList(query), () => fetchCustomers(query));

    const data = list.data || {};
    const rows = useMemo(() => data.items || [], [data.items]);

    const columns = useMemo(() => ([
        {
            id: 'name',
            title: 'Покупатель',
            cell: (row) => customerTitle(row)
        },
        {
            id: 'chatId',
            title: 'Чат',
            width: 140,
            cell: (row) => (row.chatId ? <Mono muted>{row.chatId}</Mono> : <span className={style.dash}>—</span>)
        },
        {
            id: 'platform',
            title: 'Площадка',
            width: 110,
            cell: (row) => PLATFORM_TITLES[row.platform] || row.platform
        },
        {
            id: 'orders',
            title: 'Заказов',
            width: 96,
            align: 'right',
            cell: (row) => (row.orders > 0 ? row.orders : <span className={style.dash}>0</span>)
        },
        {
            id: 'basket',
            title: 'В корзине',
            width: 110,
            cell: (row) => (row.basket > 0
                ? <Badge tone="accent">{row.basket}</Badge>
                : <span className={style.dash}>пусто</span>)
        },
        {
            id: 'favorites',
            title: 'В избранном',
            width: 120,
            cell: (row) => (row.favorites > 0 ? row.favorites : <span className={style.dash}>—</span>)
        },
        {
            id: 'createdAt',
            title: 'С нами с',
            width: 118,
            cell: (row) => <Time value={row.createdAt}/>
        }
    ]), []);

    const openCustomer = useCallback((row) => navigate(`/admin2/customers/${row.id}`), [navigate]);
    const closeCustomer = useCallback(() => navigate('/admin2/customers'), [navigate]);

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
                onOpen={openCustomer}
                search={{
                    value: draftSearch,
                    onChange: setDraftSearch,
                    placeholder: 'Имя или идентификатор чата'
                }}
                filters={(
                    <>
                        <Select
                            options={PLATFORM_OPTIONS}
                            value={value.platform}
                            onChange={(event) => patch({platform: event.target.value, page: 1})}
                        />
                        <Select
                            options={SORT_OPTIONS}
                            value={value.sorting}
                            onChange={(event) => patch({sorting: event.target.value})}
                        />
                    </>
                )}
                actions={<Button size="s" variant="ghost" onClick={list.refresh}>Обновить</Button>}
                pagination={{
                    page: data.page || value.page,
                    pages: data.pages || 1,
                    total: data.total,
                    pageSize: data.pageSize || value.pageSize,
                    onPage: (page) => patch({page}, {keepPage: true}),
                    onPageSize: (pageSize) => patch({pageSize, page: 1}, {keepPage: true})
                }}
                empty={{
                    title: value.search ? 'Никого не нашли' : 'Покупателей пока нет',
                    text: value.search
                        ? 'Поиск идёт по имени и идентификатору чата.'
                        : 'Запись заводится, когда человек первый раз открывает бота.'
                }}
                footNote="Заказы, корзина и избранное открываются в карточке покупателя."
            />

            {id ? <CustomerInspector id={Number(id)} onClose={closeCustomer}/> : null}
        </Workspace>
    );
}
