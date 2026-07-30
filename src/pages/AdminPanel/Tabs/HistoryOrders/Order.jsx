import React, {useEffect} from 'react';
import style from './History.module.scss'
import {useServer} from "./useServer";
import PopUpWindow from "../../Elements/PopUpWindow/PopUpWindow";
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

const Order = ({orderId, onClose}) => {

    const [positions, setPositions] = React.useState([]);
    const [userData, setUserData] = React.useState({});
    const [orderData, setOrderData] = React.useState({});
    const {getOrderData, sendMassageUndefinedName} = useServer()

    useEffect(() => {
        getOrderData(setPositions, setUserData, setOrderData, orderId).then();
    }, [orderId]);

    return (
        <div>
            <PopUpWindow title={'Заказ №' + orderId} onClose={onClose}>
                <div className={style['orderInfoGrid']}>
                    <div className={style['orderInfoRow']}>
                        <span className={style['orderInfoLabel']}>Пользователь</span>
                        <span className={style['orderInfoValue']}>{userData.username || 'Контакта пользователя нет'}</span>
                    </div>
                    <div className={style['orderInfoRow']}>
                        <span className={style['orderInfoLabel']}>Контакт</span>
                        <span className={style['orderInfoValue']}>{orderData.contact || '—'}</span>
                    </div>
                    <div className={style['orderInfoRow']}>
                        <span className={style['orderInfoLabel']}>Тип</span>
                        <span className={style['orderInfoValue']}>{TYPE_LABELS[orderData.type] || orderData.type || '—'}</span>
                    </div>
                    <div className={style['orderInfoRow']}>
                        <span className={style['orderInfoLabel']}>Статус</span>
                        <span className={style['orderInfoValue']}>{getOrderStatusInfo(orderData.status).label}</span>
                    </div>
                    <div className={style['orderInfoRow']}>
                        <span className={style['orderInfoLabel']}>Способ оплаты</span>
                        <span className={style['orderInfoValue']}>{PAYMENT_METHOD_LABELS[orderData.paymentMethod] || orderData.paymentMethod || '—'}</span>
                    </div>
                    <div className={style['orderInfoRow']}>
                        <span className={style['orderInfoLabel']}>Сумма / скидка</span>
                        <span className={style['orderInfoValue']}>{orderData.total ?? '—'} ₽ {orderData.discount ? `(скидка ${orderData.discount} ₽)` : ''}</span>
                    </div>
                    <div className={style['orderInfoRow']}>
                        <span className={style['orderInfoLabel']}>Страница</span>
                        <span className={style['orderInfoValue']}>{orderData.pageTitle || '—'}</span>
                    </div>
                    <div className={style['orderInfoRow']}>
                        <span className={style['orderInfoLabel']}>Email</span>
                        <span className={style['orderInfoValue']}>{orderData.email || '—'}</span>
                    </div>
                    {orderData.type === 'steam_topup' && (
                        <div className={style['orderInfoRow']}>
                            <span className={style['orderInfoLabel']}>Steam логин</span>
                            <span className={style['orderInfoValue']}>{orderData.steamLogin || '—'}</span>
                        </div>
                    )}
                    <div className={style['orderInfoRow']} style={{gridColumn: '1 / -1'}}>
                        <span className={style['orderInfoLabel']}>Данные аккаунта</span>
                        <span className={style['orderInfoValue']}>{orderData.accountData || '—'}</span>
                    </div>
                </div>

                <div className={style['tableWrapPopup']}>
                    <table className={style['table']}>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Цена</th>
                            <th>Кол-во</th>
                            <th>Сумма</th>
                        </tr>
                        </thead>
                        <tbody>
                        {positions.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.price} ₽</td>
                                <td>{item.quantity}</td>
                                <td>{item.sum} ₽</td>
                            </tr>
                        ))}
                        {positions.length === 0 ? (
                            <tr>
                                <td className={style['emptyCell']} colSpan={5}>Позиции заказа не найдены</td>
                            </tr>
                        ) : ''}
                        </tbody>
                    </table>
                </div>
                <div className={style['buttonPlaceSingle']}>
                    <div className={style['buttonAccept']} onClick={async () => {
                       await sendMassageUndefinedName(orderId)
                    }}>
                        <div/>
                        <p>Отправить сообщение</p>
                    </div>
                </div>
            </PopUpWindow>
        </div>
    );
};

export default Order;
