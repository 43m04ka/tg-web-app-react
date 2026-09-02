import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Badge,
    Button,
    Collection,
    Money,
    Mono,
    Select,
    Workspace,
    useCollectionState,
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {askConfirm} from '../../platform/notify';
import {bulkDelete, bulkUpdate, fetchCatalogs, fetchFacets, fetchProducts} from './api';
import ProductInspector from './ProductInspector';
import style from './ProductsScreen.module.scss';

const DEFAULTS = {
    search: '',
    catalogId: '',
    onSale: '',
    type: '',
    visibility: '',
    page: 1,
    pageSize: 50,
};

const SALE_OPTIONS = [
    {value: '', title: 'Продажа: любая'},
    {value: 'true', title: 'Продаётся'},
    {value: 'false', title: 'Снят с продажи'},
];

const VISIBILITY_OPTIONS = [
    {value: '', title: 'Видимость: любая'},
    {value: 'visible', title: 'Видимые'},
    {value: 'hidden', title: 'Скрытые'},
];

export default function ProductsScreen() {
    usePageHeader('Товары');

    const navigate = useNavigate();
    const {id} = useParams();
    const {value, patch} = useCollectionState(DEFAULTS);
    const [draftSearch, setDraftSearch] = useState(value.search);
    const [picked, setPicked] = useState([]);

    useEffect(() => {
        setDraftSearch(value.search);
    }, [value.search]);

    useEffect(() => {
        if (draftSearch === value.search) return undefined;

        const timerId = setTimeout(() => patch({search: draftSearch}), 300);
        return () => clearTimeout(timerId);
    }, [draftSearch, value.search, patch]);

    const query = useMemo(() => ({
        search: value.search,
        catalogId: value.catalogId,
        onSale: value.onSale,
        type: value.type,
        visibility: value.visibility,
        page: value.page,
        pageSize: value.pageSize,
    }), [value]);

    const list = useResource(keys.productList(query), () => fetchProducts(query));
    const facets = useResource(keys.productFacets, fetchFacets);
    const catalogs = useResource(keys.catalogList, fetchCatalogs);

    const catalogOptions = useMemo(() => ([
        {value: '', title: 'Каталог: любой'},
        ...((catalogs.data?.result || [])
            .slice()
            .sort((left, right) => String(left.path).localeCompare(String(right.path)))
            .map((catalog) => ({value: String(catalog.id), title: catalog.path}))),
    ]), [catalogs.data]);

    const catalogPathById = useMemo(() => {
        const map = new Map();
        (catalogs.data?.result || []).forEach((catalog) => map.set(catalog.id, catalog.path));
        return map;
    }, [catalogs.data]);

    const typeOptions = useMemo(() => ([
        {value: '', title: 'Тип: любой'},
        ...((facets.data?.types || []).map((item) => ({
            value: item.value,
            title: `${item.value} · ${item.count}`,
        }))),
    ]), [facets.data]);

    const applyBulk = useMutation(bulkUpdate, {invalidates: [keys.products]});
    const removeBulk = useMutation(bulkDelete, {invalidates: [keys.products]});

    const runBulkUpdate = useCallback(async (updateData, title) => {
        const answer = await askConfirm({
            title,
            text: `Затронуто позиций: ${picked.length}.`,
            confirmText: 'Применить',
        });

        if (!answer) return;

        const result = await applyBulk.run({ids: picked, updateData});
        if (result.ok) setPicked([]);
    }, [applyBulk, picked]);

    const runBulkDelete = useCallback(async () => {
        const answer = await askConfirm({
            title: `Удалить ${picked.length} товаров?`,
            text: 'Карточки исчезнут из каталога и с витрины.',
            consequence: 'Действие необратимо, восстановить можно только повторным парсом.',
            confirmText: 'Удалить',
            tone: 'danger',
        });

        if (!answer) return;

        const result = await removeBulk.run(picked);
        if (result.ok) setPicked([]);
    }, [removeBulk, picked]);

    const columns = useMemo(() => ([
        {
            id: 'name',
            title: 'Название',
            width: '34%',
            cell: (row) => (
                <div className={style.nameCell}>
                    <span className={style.name}>{row.name}</span>
                    {row.isHidden ? <Badge tone="neutral">скрыт</Badge> : null}
                </div>
            ),
        },
        {
            id: 'catalog',
            title: 'Каталог',
            width: 200,
            cell: (row) => <Mono muted>{catalogPathById.get(row.catalogId) || `#${row.catalogId ?? '—'}`}</Mono>,
        },
        {id: 'platform', title: 'Площадка', width: 96, cell: (row) => row.platform || '—'},
        {id: 'type', title: 'Тип', width: 128, cell: (row) => row.typeLabel || row.type || '—'},
        {
            id: 'price',
            title: 'Цена',
            width: 108,
            align: 'right',
            cell: (row) => <Money value={row.price}/>,
        },
        {
            id: 'oldPrice',
            title: 'Старая',
            width: 108,
            align: 'right',
            cell: (row) => (row.oldPrice ? <Money value={row.oldPrice} tone="muted"/> : <span className={style.dash}>—</span>),
        },
        {
            id: 'onSale',
            title: 'Продажа',
            width: 96,
            cell: (row) => (row.onSale
                ? <Badge tone="positive">в продаже</Badge>
                : <Badge tone="warning">снят</Badge>),
        },
    ]), [catalogPathById]);

    const openCard = useCallback((row) => navigate(`/admin2/products/${row.id}`), [navigate]);
    const closeCard = useCallback(() => navigate('/admin2/products'), [navigate]);

    const data = list.data || {};

    return (
        <Workspace>
            <Collection
                columns={columns}
                rows={data.items || []}
                loading={list.isLoading}
                stale={list.isStale}
                error={list.error}
                onRetry={list.refresh}
                activeKey={id ? Number(id) : null}
                onOpen={openCard}
                search={{
                    value: draftSearch,
                    onChange: setDraftSearch,
                    placeholder: 'Название товара',
                }}
                filters={(
                    <>
                        <Select
                            options={catalogOptions}
                            value={value.catalogId}
                            onChange={(event) => patch({catalogId: event.target.value})}
                        />
                        <Select
                            options={typeOptions}
                            value={value.type}
                            onChange={(event) => patch({type: event.target.value})}
                        />
                        <Select
                            options={SALE_OPTIONS}
                            value={value.onSale}
                            onChange={(event) => patch({onSale: event.target.value})}
                        />
                        <Select
                            options={VISIBILITY_OPTIONS}
                            value={value.visibility}
                            onChange={(event) => patch({visibility: event.target.value})}
                        />
                    </>
                )}
                selection={{
                    ids: picked,
                    onChange: setPicked,
                    actions: [
                        {
                            id: 'sale-on',
                            title: 'Вернуть в продажу',
                            loading: applyBulk.loading,
                            run: () => runBulkUpdate({onSale: true}, `Вернуть в продажу ${picked.length} товаров?`),
                        },
                        {
                            id: 'sale-off',
                            title: 'Снять с продажи',
                            loading: applyBulk.loading,
                            run: () => runBulkUpdate({onSale: false}, `Снять с продажи ${picked.length} товаров?`),
                        },
                        {
                            id: 'hide',
                            title: 'Скрыть',
                            loading: applyBulk.loading,
                            run: () => runBulkUpdate({isHidden: true}, `Скрыть ${picked.length} товаров?`),
                        },
                        {
                            id: 'show',
                            title: 'Показать',
                            loading: applyBulk.loading,
                            run: () => runBulkUpdate({isHidden: false}, `Показать ${picked.length} товаров?`),
                        },
                        {
                            id: 'delete',
                            title: 'Удалить',
                            tone: 'danger',
                            loading: removeBulk.loading,
                            run: runBulkDelete,
                        },
                    ],
                }}
                pagination={{
                    page: data.page || value.page,
                    pages: data.pages || 1,
                    total: data.total,
                    pageSize: data.pageSize || value.pageSize,
                    onPage: (page) => patch({page}, {keepPage: true}),
                    onPageSize: (pageSize) => patch({pageSize, page: 1}, {keepPage: true}),
                }}
                empty={{
                    title: 'Товаров по фильтрам нет',
                    text: 'Смените каталог или очистите поиск. Пустой каталог наполняется парсом в разделе «Каталоги».',
                }}
                actions={(
                    <Button
                        size="s"
                        variant="ghost"
                        onClick={() => {
                            setDraftSearch('');
                            patch({search: '', catalogId: '', onSale: '', type: '', visibility: '', page: 1}, {keepPage: true});
                        }}
                    >
                        Сбросить
                    </Button>
                )}
            />

            {id ? <ProductInspector id={Number(id)} onClose={closeCard}/> : null}
        </Workspace>
    );
}
