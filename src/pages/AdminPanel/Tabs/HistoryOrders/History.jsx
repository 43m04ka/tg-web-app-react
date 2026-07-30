import React, {useEffect, useState} from 'react';
import {useServer} from "./useServer";
import style from "./History.module.scss";
import Order from "./Order";
import {getOrderStatusInfo} from "../../../../utils/orderStatus";

const TYPE_LABELS = {
    catalog: 'Каталог',
    steam_topup: 'Steam',
};

const PAYMENT_METHOD_LABELS = {
    sbp: 'СБП',
    split: 'Сплит',
    dolyami: 'Долями',
};

const History = () => {

    const [historyList, setHistoryList] = React.useState([]);
    const {getHistoryList} = useServer()

    const [infoTabOpen, setInfoTabOpen] = useState(false);
    const [orderId, setOrderId] = React.useState(-1);
    const [searchValue, setSearchValue] = useState('');

    useEffect(()=>{
        getHistoryList(setHistoryList, '').then()
    }, [])

    const handleSearch = async (value) => {
        setSearchValue(value);
        await getHistoryList(setHistoryList, value);
    };

    return (
        <div className={style['mainContainer']}>
            <div className={style['header']}>
                <div className={style['headerTitle']}>История заказов</div>
                <div className={style['headerControls']}>
                    <input className={style['inputFind']} placeholder={'Поиск {32 или 2025.8.24}'}
                           value={searchValue}
                           onChange={async (event) => {
                               await handleSearch(event.target.value);
                           }}/>
                </div>
            </div>

            <div className={style['tableWrapMain']}>
                <table className={style['table']}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Тип</th>
                        <th>Статус</th>
                        <th>Сумма</th>
                        <th>Скидка</th>
                        <th>Оплата</th>
                        <th>Контакт</th>
                        <th>Дата</th>
                        <th>Действие</th>
                    </tr>
                    </thead>
                    <tbody>
                    {historyList.map((item) => {
                        const statusInfo = getOrderStatusInfo(item.status);
                        return (
                            <tr key={item.id} onClick={() => {
                                setInfoTabOpen(true)
                                setOrderId(item.id)
                            }}>
                                <td>{item.id}</td>
                                <td>{TYPE_LABELS[item.type] || item.type}</td>
                                <td>
                                    <span className={`${style['statusBadge']} ${style[`status_${statusInfo.group}`]}`}>
                                        {statusInfo.label}
                                    </span>
                                </td>
                                <td>{item.total} ₽</td>
                                <td>{item.discount ? `${item.discount} ₽` : '—'}</td>
                                <td>{PAYMENT_METHOD_LABELS[item.paymentMethod] || item.paymentMethod}</td>
                                <td>{item.contact || '—'}</td>
                                <td>{item.createdAt ? (new Date(item.createdAt)).toLocaleString() : ''}</td>
                                <td>
                                    <button className={style['actionButton']} onClick={(event) => {
                                        event.stopPropagation();
                                        setInfoTabOpen(true)
                                        setOrderId(item.id)
                                    }}>
                                        Подробнее
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {historyList.length === 0 ? (
                        <tr>
                            <td className={style['emptyCell']} colSpan={9}>Заказы не найдены</td>
                        </tr>
                    ) : ''}
                    </tbody>
                </table>
            </div>

            {infoTabOpen ? <Order onClose={() => {
                setInfoTabOpen(false);
            }} orderId={orderId}/> : ''}
        </div>);

};

export default History;

