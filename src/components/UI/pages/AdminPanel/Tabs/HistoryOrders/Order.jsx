import React, {useEffect} from 'react';
import BlockLabel from "../../Elements/BlockLabel";
import style from "./History.module.scss";
import {useServer} from "./useServer";
import SeparatorLabel from "../../Elements/SeparatorLabel";
import ButtonLabel from "../../Elements/ButtonLabel";


const Order = ({orderId}) => {

    const [orderData, setOrderData] = React.useState(null);
    const {getOrderData, sendMassageUndefinedName} = useServer()

    useEffect(() => {
        getOrderData(setOrderData, orderId).then();
    }, [orderId]);

    return (
        <div>
            <BlockLabel label={'Заказ №' + orderId}>
                {orderData !== null ? (<>{
                    orderData.map((item, index) => (
                        <div style={{borderBottom : '1px solid gray', width:'290px', margin: '5px 0 0 5px', display:'grid', gridTemplateColumns:'70px 70px 1fr', justifyItems:'center', overflow:'hidden', lineHeight:'20px', height:'20px'}}>
                            <div className={style['order-choice-label']}>{'#' + item.body.id}</div>
                            <div className={style['order-choice-label']}>{item.body.price + '₽'}</div>
                            <div className={style['order-choice-label']}>{item.body.name}</div>
                        </div>
                    ))
                }</>) : (<div className={style['order-choice-label']}>Загрузка данных...</div>)}
                <SeparatorLabel/>
                <ButtonLabel label={'Отправить напоминание'} onClick={() => sendMassageUndefinedName(orderId)}/>
            </BlockLabel>
        </div>
    );
};

export default Order;