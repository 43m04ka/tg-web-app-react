import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Badge,
    Button,
    Collection,
    Field,
    Inspector,
    InspectorRows,
    InspectorSection,
    Mono,
    Select,
    Tabs,
    Textarea,
    Workspace,
    useCollectionState
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import {keys} from '../../platform/resources';
import {useMutation} from '../../platform/useMutation';
import {useResource} from '../../platform/useResource';
import {fetchMarketplaceFile, fetchMarketplaceOrder, fetchMarketplaceOrders, updateMarketplaceOrder} from './api';
import style from './MarketplaceScreen.module.scss';

const DEFAULTS = {
    search: '',
    status: '',
    marketplace: '',
    page: 1,
    pageSize: 50
};

const STATUS = {
    new: {title: 'Новая', tone: 'info'},
    progress: {title: 'В работе', tone: 'warning'},
    done: {title: 'Выполнена', tone: 'positive'},
    rejected: {title: 'Отклонена', tone: 'danger'}
};

const MARKETPLACES = ['Ozon', 'Wildberries', 'Яндекс Маркет', 'МегаМаркет', 'Avito', 'Другой'];

const dateTime = (value) => (value
    ? new Date(value).toLocaleString('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})
    : '');

const orderDay = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    return match ? `${match[3]}.${match[2]}.${match[1]}` : String(value || '');
};

const contactsOf = (order) => [order.telegram, order.phone, order.email, order.contact].filter(Boolean).join(' · ');

const telegramLink = (value) => {
    const handle = String(value || '').trim().replace(/^@/, '').replace(/^https?:\/\/t\.me\//i, '');
    return /^[a-z0-9_]{4,}$/i.test(handle) ? `https://t.me/${handle}` : '';
};

function StatusBadge({status}) {
    const item = STATUS[status] || STATUS.new;
    return <Badge tone={item.tone}>{item.title}</Badge>;
}

function OrderFile({order}) {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!order.fileType) return undefined;

        let url = '';
        let alive = true;

        fetchMarketplaceFile(order.id)
            .then(({blob}) => {
                if (!alive) return;
                url = URL.createObjectURL(blob);
                setFile(url);
            })
            .catch(() => alive && setError('Не удалось загрузить файл'));

        return () => {
            alive = false;
            if (url) URL.revokeObjectURL(url);
        };
    }, [order.id, order.fileType]);

    if (!order.fileType) return <span className={style.muted}>Покупатель не прикладывал файл</span>;
    if (error) return <span className={style.muted}>{error}</span>;
    if (!file) return <span className={style.muted}>Загружаем…</span>;

    const isImage = order.fileType.startsWith('image/') && order.fileType !== 'image/heic';

    return (
        <div className={style.file}>
            {isImage ? (
                <a href={file} target="_blank" rel="noreferrer">
                    <img className={style.fileImage} src={file} alt={order.fileName || 'Чек'}/>
                </a>
            ) : null}

            <a className={style.fileLink} href={file} download={order.fileName || 'check'} target="_blank" rel="noreferrer">
                {isImage ? 'Открыть в полном размере' : `Скачать ${order.fileName || 'файл'}`}
            </a>
        </div>
    );
}

function OrderInspector({id, onClose}) {
    const card = useResource(keys.marketplaceOrder(id), () => fetchMarketplaceOrder(id));
    const order = card.data?.result || null;

    const [note, setNote] = useState('');

    useEffect(() => {
        setNote(order?.note || '');
    }, [order?.id, order?.note]);

    const save = useMutation(updateMarketplaceOrder, {
        invalidates: [keys.marketplaceOrders],
        done: 'Заявка обновлена'
    });

    const setStatus = useCallback((status) => save.run({id, status}), [id, save]);

    const tg = telegramLink(order?.telegram);

    return (
        <Inspector
            open
            title={order ? `Заявка №${order.id}` : 'Заявка'}
            subtitle={order ? `${order.marketplace} · заказ ${order.orderNumber}` : ''}
            badge={order ? <StatusBadge status={order.status}/> : null}
            onClose={onClose}
            loading={card.isLoading}
            error={card.error}
            onRetry={card.refresh}
            dirty={Boolean(order) && note !== (order.note || '')}
            footer={order ? (
                <Button
                    variant="primary"
                    disabled={note === (order.note || '')}
                    loading={save.loading}
                    onClick={() => save.run({id, note})}
                >
                    Сохранить заметку
                </Button>
            ) : null}
        >
            {order ? (
                <>
                    <InspectorSection title="Статус">
                        <div className={style.statuses}>
                            {Object.entries(STATUS).map(([key, item]) => (
                                <Button
                                    key={key}
                                    size="s"
                                    variant={order.status === key ? 'primary' : 'secondary'}
                                    disabled={save.loading}
                                    onClick={() => setStatus(key)}
                                >
                                    {item.title}
                                </Button>
                            ))}
                        </div>
                    </InspectorSection>

                    <InspectorSection title="Заказ">
                        <InspectorRows items={[
                            {label: 'Площадка', value: order.marketplace},
                            {label: 'Номер заказа', value: <Mono>{order.orderNumber}</Mono>},
                            {label: 'Дата заказа', value: orderDay(order.orderDate)},
                            order.product ? {label: 'Товар', value: order.product} : null,
                            {label: 'Заявка получена', value: dateTime(order.createdAt)},
                            {label: 'Сообщение менеджеру', value: order.notified ? 'отправлено' : 'не дошло'}
                        ]}/>
                    </InspectorSection>

                    <InspectorSection title="Покупатель">
                        <InspectorRows items={[
                            {label: 'Имя', value: order.name},
                            order.telegram ? {
                                label: 'Telegram',
                                value: tg ? <a className={style.fileLink} href={tg} target="_blank" rel="noreferrer">{order.telegram}</a> : order.telegram
                            } : null,
                            order.phone ? {label: 'Телефон', value: <a className={style.fileLink} href={`tel:${order.phone}`}>{order.phone}</a>} : null,
                            order.email ? {label: 'E-mail', value: <a className={style.fileLink} href={`mailto:${order.email}`}>{order.email}</a>} : null,
                            order.contact ? {label: 'Контакт', value: order.contact} : null
                        ]}/>
                    </InspectorSection>

                    {order.accountData || order.comment ? (
                        <InspectorSection title="Данные от покупателя">
                            <InspectorRows items={[
                                order.accountData ? {label: 'Для активации', value: <span className={style.pre}>{order.accountData}</span>} : null,
                                order.comment ? {label: 'Комментарий', value: <span className={style.pre}>{order.comment}</span>} : null
                            ]}/>
                        </InspectorSection>
                    ) : null}

                    <InspectorSection title="Чек или скриншот">
                        <OrderFile order={order}/>
                    </InspectorSection>

                    <InspectorSection title="Заметка менеджера" note="Видна только в админке">
                        <Field>
                            <Textarea
                                rows={4}
                                value={note}
                                placeholder="Например: код отправлен в Telegram"
                                onChange={(event) => setNote(event.target.value)}
                            />
                        </Field>
                    </InspectorSection>
                </>
            ) : null}
        </Inspector>
    );
}

export default function MarketplaceScreen() {
    usePageHeader('Маркетплейсы');

    const navigate = useNavigate();
    const {id} = useParams();
    const {value, patch, withQuery} = useCollectionState(DEFAULTS);

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
        status: value.status,
        marketplace: value.marketplace,
        page: Number(value.page) || 1,
        pageSize: Number(value.pageSize) || 50
    }), [value]);

    const list = useResource(keys.marketplaceOrderList(query), () => fetchMarketplaceOrders(query));
    const data = list.data || {};
    const rows = data.result || [];
    const counts = data.counts || {};
    const allCount = Object.values(counts).reduce((sum, count) => sum + count, 0);

    const columns = useMemo(() => [
        {id: 'id', title: '№', width: 70, cell: (row) => <Mono>{row.id}</Mono>},
        {id: 'created', title: 'Получена', width: 150, cell: (row) => dateTime(row.createdAt)},
        {
            id: 'order',
            title: 'Заказ',
            cell: (row) => (
                <span className={style.order}>
                    <span className={style.orderMain}>{row.marketplace} · <Mono>{row.orderNumber}</Mono></span>
                    {row.product ? <span className={style.muted}>{row.product}</span> : null}
                </span>
            )
        },
        {
            id: 'customer',
            title: 'Покупатель',
            width: 260,
            cell: (row) => (
                <span className={style.order}>
                    <span className={style.orderMain}>{row.name}</span>
                    <span className={style.muted}>{contactsOf(row)}</span>
                </span>
            )
        },
        {id: 'file', title: 'Чек', width: 70, cell: (row) => (row.fileType ? 'есть' : '')},
        {id: 'status', title: 'Статус', width: 120, cell: (row) => <StatusBadge status={row.status}/>}
    ], []);

    const open = useCallback((row) => navigate(withQuery(`/admin/marketplace/${row.id}`)), [navigate, withQuery]);
    const close = useCallback(() => navigate(withQuery('/admin/marketplace')), [navigate, withQuery]);

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
                onOpen={open}
                search={{
                    value: draftSearch,
                    onChange: setDraftSearch,
                    placeholder: 'Номер заказа, имя, телефон, @ник'
                }}
                filters={(
                    <Tabs
                        items={[
                            {id: '', title: 'Все', count: allCount},
                            ...Object.entries(STATUS).map(([key, item]) => ({id: key, title: item.title, count: counts[key] ?? 0}))
                        ]}
                        value={value.status}
                        onChange={(next) => patch({status: next, page: 1})}
                    />
                )}
                actions={(
                    <>
                        <Select
                            options={[{value: '', title: 'Все площадки'}, ...MARKETPLACES.map((item) => ({value: item, title: item}))]}
                            value={value.marketplace}
                            onChange={(event) => patch({marketplace: event.target.value, page: 1})}
                        />
                        <Button size="s" variant="ghost" onClick={list.refresh}>Обновить</Button>
                    </>
                )}
                pagination={{
                    page: query.page,
                    pages: Math.max(1, Math.ceil((data.total || 0) / query.pageSize)),
                    total: data.total,
                    pageSize: query.pageSize,
                    onPage: (page) => patch({page}, {keepPage: true}),
                    onPageSize: (pageSize) => patch({pageSize, page: 1}, {keepPage: true})
                }}
                empty={{
                    title: value.search ? 'Ничего не нашлось' : 'Заявок пока нет',
                    text: value.search
                        ? 'Поиск идёт по номеру заказа, имени, контактам и товару.'
                        : 'Заявки появляются здесь, когда покупатель заполняет форму «Получить заказ с маркетплейса».'
                }}
            />

            {id ? <OrderInspector key={id} id={Number(id)} onClose={close}/> : null}
        </Workspace>
    );
}
