import React, {useEffect, useMemo, useState} from 'react';
import TabPane from '../../Elements/WorkTabs/TabPane';
import f, {Group, Row, Sheet} from '../../Elements/FormLayout/FormLayout';
import s from './History.module.scss';
import useData from '../../useData';
import {useServer} from './useServer';
import {useFeedback} from '../../Elements/Feedback/Feedback';
import {STATUS_OPTIONS, TYPE_LABELS, PAYMENT_METHOD_LABELS} from './orderOptions';

/**
 * Просмотр и правка заказа. Заменил попап Order — тот держал только чтение,
 * статус заказа менялся исключительно ботом (по кнопке в Telegram или по факту
 * оплаты), а разбор нештатных ситуаций (оплата мимо кассы, ошибочный статус)
 * требовал лезть в базу руками.
 */
const OrderForm = ({orderId, onClose}) => {
    const {authenticationData} = useData();
    const {getOrderData, setOrderStatus, sendMassageUndefinedName} = useServer();
    const {showToast} = useFeedback();

    const [loading, setLoading] = useState(true);
    const [positions, setPositions] = useState([]);
    const [user, setUser] = useState({});
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('');
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getOrderData(orderId);
            setPositions(data.positions);
            setUser(data.user);
            setOrder(data.order);
            setStatus(data.order.status || '');
        } catch (error) {
            showToast(error.message || 'Не удалось загрузить заказ', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [orderId]);

    const statusChanged = order && status !== order.status;

    const handleSaveStatus = async () => {
        if (!statusChanged) return;

        setSaving(true);
        try {
            await setOrderStatus(authenticationData, orderId, status);
            setOrder((prev) => ({...prev, status}));
            showToast('Статус заказа изменён', 'success');
        } catch (error) {
            showToast(error.message || 'Не удалось изменить статус', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSendMessage = async () => {
        setSending(true);
        try {
            await sendMassageUndefinedName(orderId);
            showToast('Сообщение отправлено', 'success');
        } catch (error) {
            showToast(error.message || 'Не удалось отправить сообщение', 'error');
        } finally {
            setSending(false);
        }
    };

    const total = useMemo(() => positions.reduce((sum, pos) => sum + (pos.sum || 0), 0), [positions]);

    if (loading) {
        return (
            <TabPane>
                <p className={s['formNote']}>Загрузка…</p>
            </TabPane>
        );
    }

    if (!order) {
        return (
            <TabPane>
                <p className={s['formNote']}>Заказ не найден.</p>
            </TabPane>
        );
    }

    return (
        <TabPane
            narrow
            footer={(
                <>
                    <span className={s['formStatus']}>
                        {statusChanged ? 'Статус изменён — не сохранён' : 'Изменений нет'}
                    </span>
                    <button type="button" className={s['btn']} disabled={sending} onClick={handleSendMessage}>
                        {sending ? 'Отправка…' : 'Отправить сообщение'}
                    </button>
                    <button type="button" className={s['btn']} onClick={onClose}>Закрыть</button>
                    <button type="button" className={`${s['btn']} ${s['btnPrimary']}`}
                            disabled={saving || !statusChanged} onClick={handleSaveStatus}>
                        {saving ? 'Сохранение…' : 'Сохранить статус'}
                    </button>
                </>
            )}
        >
            <Sheet>
                <Group title="Заказ">
                    <Row label="Дата">
                        <span className={f.mono}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</span>
                    </Row>
                    <Row label="Тип">
                        <span>{TYPE_LABELS[order.type] || order.type || '—'}</span>
                    </Row>
                    <Row label="Страница">
                        <span>{order.pageTitle || '—'}</span>
                    </Row>
                </Group>

                <Group title="Клиент">
                    <Row label="Пользователь">
                        <span>{user.username || 'Контакта нет'}</span>
                    </Row>
                    <Row label="Контакт" wide>
                        <span>{order.contact || '—'}</span>
                    </Row>
                    {order.email ? (
                        <Row label="Email">
                            <span>{order.email}</span>
                        </Row>
                    ) : null}
                    {order.type === 'steam_topup' && order.steamLogin ? (
                        <Row label="Steam логин">
                            <span className={f.mono}>{order.steamLogin}</span>
                        </Row>
                    ) : null}
                    {order.accountData ? (
                        <Row label="Данные аккаунта" wide top>
                            <span className={s['formNote']} style={{whiteSpace: 'pre-wrap'}}>{order.accountData}</span>
                        </Row>
                    ) : null}
                </Group>

                <Group title="Оплата">
                    <Row label="Способ">
                        <span>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod || '—'}</span>
                    </Row>
                    <Row label="Сумма">
                        <span className={f.mono}>{order.total ?? total} ₽</span>
                    </Row>
                    {order.discount ? (
                        <Row label="Скидка">
                            <span className={f.mono}>{order.discount} ₽</span>
                        </Row>
                    ) : null}
                    <Row label="Статус" hint="Смена статуса — ручное действие: обходит обычную проверку переходов, поэтому доступна на любой статус">
                        <select className={`${f.input} ${f.select}`} value={status}
                                onChange={(event) => setStatus(event.target.value)}>
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.key} value={option.key}>{option.name}</option>
                            ))}
                        </select>
                    </Row>
                </Group>

                <Group title="Позиции">
                    <Row label="" wide top>
                        <div className={s['positionsWrap']}>
                            <table className={s['positionsTable']}>
                                <thead>
                                    <tr>
                                        <th>Название</th>
                                        <th>Цена</th>
                                        <th>Кол-во</th>
                                        <th>Сумма</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {positions.map((item) => (
                                        <React.Fragment key={item.id}>
                                            <tr>
                                                <td>{item.name}</td>
                                                <td className={f.mono}>{item.price} ₽</td>
                                                <td className={f.mono}>{item.quantity}</td>
                                                <td className={f.mono}>{item.sum} ₽</td>
                                            </tr>
                                            {item.meta?.items?.length ? (
                                                <tr>
                                                    <td colSpan={4} className={s['positionSub']}>
                                                        {item.meta.items.map((sub, index) => (
                                                            <span key={index} className={s['positionSubItem']}>
                                                                {sub.name}{sub.quantity > 1 ? ` ×${sub.quantity}` : ''}
                                                            </span>
                                                        ))}
                                                        {item.meta.leftoverRs ? (
                                                            <span className={s['positionSubItem']}>
                                                                Остаток на балансе — {item.meta.leftoverRs}Rs
                                                            </span>
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            ) : null}
                                        </React.Fragment>
                                    ))}
                                    {positions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className={s['emptyCell']}>Позиции заказа не найдены</td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                    </Row>
                </Group>
            </Sheet>
        </TabPane>
    );
};

export default OrderForm;
