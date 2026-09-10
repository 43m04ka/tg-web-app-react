import React, {useCallback, useMemo, useState} from 'react';
import {
    Badge,
    Button,
    Inspector,
    InspectorRows,
    InspectorSection,
    Money,
    Mono,
    Note,
    Select,
    Time,
} from '../../ui';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {askConfirm, toast, toastFail} from '../../platform/notify';
import {fetchOrder, markPayoutManual, notifyClosedProfile, setOrderStatus} from './api';
import {
    PAYMENT_TITLES,
    PAYOUT_TITLES,
    PAYOUT_TONES,
    PLATFORM_TITLES,
    STATUS_TITLES,
    TYPE_TITLES,
    isTransitionKnown,
    statusTitle,
    statusTone,
} from './model';
import style from './OrderInspector.module.scss';

const TABS = [
    {id: 'main', title: 'Заказ'},
    {id: 'payment', title: 'Оплата'},
    {id: 'delivery', title: 'Выдача'},
    {id: 'customer', title: 'Покупатель'},
];

const STATUS_OPTIONS = Object.entries(STATUS_TITLES).map(([value, title]) => ({value, title}));

const copyText = async (text, done) => {
    try {
        await navigator.clipboard.writeText(text);
        toast({tone: 'positive', title: done});
    } catch {
        toastFail('Буфер обмена недоступен', 'Скопируйте вручную из карточки');
    }
};

export default function OrderInspector({id, onClose}) {
    const [tab, setTab] = useState('main');
    const [nextStatus, setNextStatus] = useState('');

    const card = useResource(keys.order(id), () => fetchOrder(id));
    const order = card.data?.order || null;
    const positions = card.data?.result || [];
    const user = card.data?.user || null;
    const codes = card.data?.codes || [];

    const changeStatus = useMutation(setOrderStatus, {
        invalidates: [keys.orders],
        done: 'Статус изменён',
    });

    const payout = useMutation(markPayoutManual, {
        invalidates: [keys.orders],
        done: 'Отмечено ручное пополнение',
    });

    const closedProfile = useMutation(notifyClosedProfile, {
        done: 'Сообщение отправлено покупателю',
    });

    const onChangeStatus = useCallback(async () => {
        if (!nextStatus || !order) return;

        const known = isTransitionKnown(order.status, nextStatus);

        const answer = await askConfirm({
            title: `Перевести заказ #${order.id} в «${statusTitle(nextStatus)}»?`,
            text: `Сейчас статус «${statusTitle(order.status)}».`,
            consequence: known
                ? 'Обычный переход жизненного цикла заказа.'
                : 'Переход выходит за жизненный цикл: сервер проверок не делает, уведомления покупателю не уйдут.',
            confirmText: 'Сменить статус',
            tone: known ? 'accent' : 'danger',
        });

        if (!answer) return;

        const result = await changeStatus.run({orderId: order.id, status: nextStatus});
        if (result.ok) {
            setNextStatus('');
            card.refresh();
        }
    }, [nextStatus, order, changeStatus, card]);

    const onPayoutManual = useCallback(async () => {
        if (!order) return;

        const answer = await askConfirm({
            title: `Отметить ручное пополнение по заказу #${order.id}?`,
            text: `Логин Steam: ${order.steamLogin || 'не указан'}.`,
            consequence: 'Заказ закроется как выполненный, покупатель получит уведомление о зачислении.',
            confirmText: 'Отметить',
        });

        if (!answer) return;

        const result = await payout.run(order.id);
        if (result.ok) card.refresh();
    }, [order, payout, card]);

    const composition = useMemo(() => {
        if (!order) return '';

        const lines = positions.map((item) => `${item.name} × ${item.quantity} — ${item.sum} ₽`);
        return [`Заказ #${order.id}`, ...lines, `Итого: ${order.total} ₽`].join('\n');
    }, [order, positions]);

    const calc = order?.calc || null;

    return (
        <Inspector
            title={order ? `Заказ #${order.id}` : `Заказ #${id}`}
            subtitle={order ? `${TYPE_TITLES[order.type] || order.type} · ${PLATFORM_TITLES[order.platform] || order.platform}` : ''}
            badge={order ? <Badge tone={statusTone(order.status)}>{statusTitle(order.status)}</Badge> : null}
            tabs={TABS}
            tab={tab}
            onTab={setTab}
            onClose={onClose}
            loading={card.isLoading}
            error={card.error}
            onRetry={card.refresh}
            width="l"
            footer={(
                <>
                    <Select
                        options={[{value: '', title: 'Сменить статус…'}, ...STATUS_OPTIONS]}
                        value={nextStatus}
                        onChange={(event) => setNextStatus(event.target.value)}
                    />
                    <Button
                        variant={nextStatus && order && !isTransitionKnown(order.status, nextStatus) ? 'danger' : 'primary'}
                        disabled={!nextStatus}
                        loading={changeStatus.loading}
                        onClick={onChangeStatus}
                    >
                        Применить
                    </Button>
                </>
            )}
        >
            {!order ? null : tab === 'main' ? (
                <>
                    <InspectorSection title="Заказ">
                        <InspectorRows items={[
                            {label: 'Создан', value: <Time value={order.createdAt}/>},
                            {label: 'Обновлён', value: <Time value={order.updatedAt}/>},
                            {label: 'Тип', value: TYPE_TITLES[order.type] || order.type},
                            {label: 'Площадка', value: PLATFORM_TITLES[order.platform] || order.platform},
                            {label: 'Страница', value: order.pageTitle || '—'},
                            {label: 'Промокод', value: order.promoCode || '—'},
                        ]}/>
                    </InspectorSection>

                    <InspectorSection
                        title="Позиции"
                        actions={(
                            <Button size="s" variant="ghost" onClick={() => copyText(composition, 'Состав заказа скопирован')}>
                                Скопировать состав
                            </Button>
                        )}
                    >
                        {positions.length ? (
                            <ul className={style.positions}>
                                {positions.map((item) => (
                                    <li key={item.id} className={style.position}>
                                        <span className={style.positionName}>{item.name}</span>
                                        <span className={style.positionMeta}>
                                            {item.quantity} × <Money value={item.price}/>
                                        </span>
                                        <Money value={item.sum}/>
                                    </li>
                                ))}
                            </ul>
                        ) : <Note>Позиций нет — это пополнение баланса.</Note>}
                    </InspectorSection>

                    <InspectorSection title="Расчёт">
                        <InspectorRows items={[
                            {label: 'Товары', value: <Money value={order.itemsTotal}/>},
                            {label: 'Скидка', value: <Money value={order.discount}/>},
                            order.topupAmount ? {label: 'Сумма пополнения', value: <Money value={order.topupAmount}/>} : null,
                            {label: 'Итого', value: <Money value={order.total}/>},
                            order.invoiceAmount ? {label: 'Ушло в кассу', value: <Money value={order.invoiceAmount}/>} : null,
                            calc?.commission ? {label: 'Комиссия', value: <Money value={calc.commission}/>} : null,
                        ]}/>
                    </InspectorSection>
                </>
            ) : tab === 'payment' ? (
                <InspectorSection title="Оплата">
                    <InspectorRows items={[
                        {label: 'Способ', value: PAYMENT_TITLES[order.paymentMethod] || order.paymentMethod},
                        {label: 'Провайдер', value: order.paymentProvider},
                        {label: 'Касса', value: order.paymentShop || '—'},
                        {label: 'Счёт', value: <Mono>{order.invoiceId || '—'}</Mono>},
                        {label: 'Платёж', value: <Mono>{order.paymentId || '—'}</Mono>},
                        {label: 'Срок счёта', value: <Time value={order.paymentExpiresAt}/>},
                        {
                            label: 'Ссылка',
                            value: order.paymentUrl
                                ? <a className={style.link} href={order.paymentUrl} target="_blank" rel="noreferrer">Открыть счёт</a>
                                : '—',
                        },
                    ]}/>
                </InspectorSection>
            ) : tab === 'delivery' ? (
                <>
                    {order.type === 'steam_topup' ? (
                        <InspectorSection title="Пополнение Steam">
                            <InspectorRows items={[
                                {label: 'Логин', value: <Mono>{order.steamLogin || '—'}</Mono>},
                                {
                                    label: 'Выплата',
                                    value: (
                                        <Badge tone={PAYOUT_TONES[order.payoutStatus] || 'neutral'}>
                                            {PAYOUT_TITLES[order.payoutStatus] || order.payoutStatus}
                                        </Badge>
                                    ),
                                },
                                {label: 'Вручную', value: order.payoutManual ? 'да' : 'нет'},
                                {label: 'Зачислено', value: <Time value={order.payoutCompletedAt}/>},
                                order.payoutError ? {label: 'Ошибка кассы', value: order.payoutError} : null,
                            ]}/>

                            {order.payoutStatus === 'error' ? (
                                <Note tone="danger">
                                    Деньги приняты, а выплата не ушла. Пополните баланс вручную и отметьте это ниже.
                                </Note>
                            ) : null}

                            <Button
                                variant="secondary"
                                onClick={onPayoutManual}
                                loading={payout.loading}
                                disabled={order.payoutManual}
                            >
                                {order.payoutManual ? 'Ручное пополнение отмечено' : 'Отметить ручное пополнение'}
                            </Button>
                        </InspectorSection>
                    ) : null}

                    {order.type === 'code_order' ? (
                        <InspectorSection
                            title="Коды"
                            actions={codes.length ? (
                                <Button
                                    size="s"
                                    variant="ghost"
                                    onClick={() => copyText(codes.map((item) => item.code).join('\n'), 'Коды скопированы')}
                                >
                                    Скопировать
                                </Button>
                            ) : null}
                        >
                            {codes.length ? (
                                <ul className={style.codes}>
                                    {codes.map((item) => (
                                        <li key={item.id}><Mono>{item.code}</Mono></li>
                                    ))}
                                </ul>
                            ) : <Note>Коды ещё не выданы — они уходят покупателю после оплаты.</Note>}
                        </InspectorSection>
                    ) : null}

                    {order.type === 'catalog' ? (
                        <InspectorSection title="Выдача">
                            <Note>
                                Каталожный заказ выдаёт менеджер. Когда всё передано покупателю, переведите заказ в «Выполнен».
                            </Note>
                        </InspectorSection>
                    ) : null}
                </>
            ) : (
                <InspectorSection
                    title="Покупатель"
                    actions={(
                        <Button size="s" variant="ghost" loading={closedProfile.loading} onClick={() => closedProfile.run(order.id)}>
                            Написать о закрытом профиле
                        </Button>
                    )}
                >
                    <InspectorRows items={[
                        {label: 'Контакт', value: order.contact || '—'},
                        {label: 'Почта', value: order.email || '—'},
                        {label: 'Данные аккаунта', value: order.accountData || '—'},
                        {label: 'chatId', value: <Mono>{user?.chatId || '—'}</Mono>},
                        {label: 'Платформа', value: PLATFORM_TITLES[user?.platform] || user?.platform || '—'},
                        {
                            label: 'Профиль',
                            value: user?.chatId
                                ? <a className={style.link} href={`tg://user?id=${user.chatId}`}>Открыть в Telegram</a>
                                : '—',
                        },
                    ]}/>
                </InspectorSection>
            )}
        </Inspector>
    );
}
