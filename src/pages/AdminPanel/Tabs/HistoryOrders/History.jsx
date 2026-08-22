import React, {useCallback, useEffect, useRef, useState} from 'react';
import style from './History.module.scss';
import {useServer} from './useServer';
import WorkTabs, {useWorkTabs} from '../../Elements/WorkTabs/WorkTabs';
import {useFeedback} from '../../Elements/Feedback/Feedback';
import OrderForm from './OrderForm';
import {statusName, statusTone, TYPE_LABELS, PAYMENT_METHOD_LABELS} from './orderOptions';

const HistoryList = ({onCountChange}) => {
    const server = useServer();
    const serverRef = useRef(server);
    serverRef.current = server;

    const {openTab, closeTab, updateTab} = useWorkTabs();
    const {showToast} = useFeedback();

    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInputValue, setSearchInputValue] = useState('');
    const debounceRef = useRef(null);

    const load = useCallback(async (search) => {
        setLoading(true);
        try {
            const result = await serverRef.current.getHistoryList(search);
            setHistoryList(result);
        } catch (error) {
            showToast(error.message || 'Не удалось загрузить список заказов', 'error');
            setHistoryList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(''); }, [load]);

    useEffect(() => {
        onCountChange(loading ? 'Загрузка…' : `Показано: ${historyList.length}`);
    }, [loading, historyList.length, onCountChange]);

    const onSearchChange = (value) => {
        setSearchInputValue(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => load(value.trim()), 350);
    };

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    // Список докладывается ботом сам по себе (оплата, смена статуса) — подпись открытой
    // вкладки может устареть между открытием и перезагрузкой списка, поэтому обновляем её
    // при каждой перезагрузке, а не только при открытии
    useEffect(() => {
        historyList.forEach((item) => updateTab(`order-${item.id}`, {
            title: `Заказ №${item.id}`,
            subtitle: `${TYPE_LABELS[item.type] || item.type} · ${statusName(item.status)}`,
        }));
    }, [historyList]);

    const openOrder = useCallback((order) => {
        const id = `order-${order.id}`;
        openTab({
            id,
            title: `Заказ №${order.id}`,
            subtitle: `${TYPE_LABELS[order.type] || order.type} · ${statusName(order.status)}`,
            entity: 'order',
            entityId: order.id,
            content: <OrderForm orderId={order.id} onClose={() => closeTab(id)}/>,
        });
    }, [openTab, closeTab]);

    return (
        <div className={style['screen']}>
            <header className={style['header']}>
                <div className={style['headerTop']}>
                    <h1 className={style['title']}>История заказов</h1>
                    <span className={style['counter']}>
                        {loading ? 'Загрузка…' : `Показано: ${historyList.length}`}
                    </span>
                </div>

                <div className={style['toolbar']}>
                    <div className={style['searchField']}>
                        <svg className={style['searchIcon']} viewBox="0 0 24 24" width="16" height="16"
                             fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <circle cx="11" cy="11" r="7"/>
                            <path d="m20 20-3.5-3.5" strokeLinecap="round"/>
                        </svg>
                        <input className={style['searchInput']}
                               placeholder="Поиск {32 или 2025.8.24}"
                               value={searchInputValue}
                               onChange={(event) => onSearchChange(event.target.value)}/>
                        {searchInputValue ? (
                            <button type="button" className={style['searchClear']}
                                    onClick={() => onSearchChange('')} aria-label="Очистить">
                                ✕
                            </button>
                        ) : null}
                    </div>
                    <button type="button" className={style['btn']} onClick={() => load(searchInputValue.trim())}>
                        Обновить
                    </button>
                </div>
            </header>

            <div className={style['tableWrap']}>
                <table className={style['table']}>
                    <thead>
                        <tr>
                            <th className={style['orderCol']}>ID</th>
                            <th>Страница</th>
                            <th className={style['statusCol']}>Статус</th>
                            <th>Сумма</th>
                            <th>Скидка</th>
                            <th>Оплата</th>
                            <th>Контакт</th>
                            <th>Дата</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyList.length === 0 ? (
                            <tr>
                                <td className={style['emptyCell']} colSpan={8}>
                                    {loading ? 'Загрузка…' : 'Заказы не найдены'}
                                </td>
                            </tr>
                        ) : historyList.map((item) => (
                            <tr key={item.id} onClick={() => openOrder(item)}>
                                <td className={style['mono']}>№{item.id}</td>
                                <td>{item.pageTitle || TYPE_LABELS[item.type] || item.type}</td>
                                <td className={style['statusCol']}>
                                    <span className={`${style['badge']} ${style[`badge_${statusTone(item.status)}`]}`}>
                                        {statusName(item.status)}
                                    </span>
                                </td>
                                <td className={style['mono']}>{item.total} ₽</td>
                                <td className={style['mono']}>{item.discount ? `${item.discount} ₽` : '—'}</td>
                                <td>{PAYMENT_METHOD_LABELS[item.paymentMethod] || item.paymentMethod}</td>
                                <td>{item.contact || '—'}</td>
                                <td className={style['mono']}>
                                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const History = () => {
    const [subtitle, setSubtitle] = useState('');

    return (
        <WorkTabs rootTitle="Заказы" rootSubtitle={subtitle}>
            <HistoryList onCountChange={setSubtitle}/>
        </WorkTabs>
    );
};

export default History;
