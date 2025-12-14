import React, {useEffect} from 'react';
import style from './History.module.scss'
import {useServer} from "./useServer";
import SeparatorLabel from "../../Elements/SeparatorLabel";
import ButtonLabel from "../../Elements/ButtonLabel";
import PopUpWindow from "../../Elements/PopUpWindow/PopUpWindow";
import List from "../../Elements/List/List";


const Order = ({orderId, onClose}) => {

    const [orderData, setOrderData] = React.useState([]);
    const [userData, setUserData] = React.useState([]);
    const {getOrderData, sendMassageUndefinedName} = useServer()

    useEffect(() => {
        getOrderData(setOrderData, setUserData, orderId).then();
    }, [orderId]);

    const cap = {
        name: ['Id', 'Имя', 'Цена'],
        key: ['id', (item) => {
            return item.body.name
        }, (item) => {
            return item.body.price
        }],
    }

    const positionOptionsList = {
        name: [],
        key: [],
    }

    return (
        <div>
            <PopUpWindow title={'Заказ №' + orderId}>
                <List listData={orderData} cap={cap} positionOptions={positionOptionsList}
                      checkBoxType={'none'} selectList={[]}/>
                <div className={style['infoLabel']}>
                    {userData.username || 'Контакта пользователля нет'}
                </div>
                <div className={style['buttonPlace']}>
                    <div className={style['buttonCancel']} onClick={() => {
                        onClose();
                    }}>
                        <div/>
                        <p>Закрыть</p>
                    </div>

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