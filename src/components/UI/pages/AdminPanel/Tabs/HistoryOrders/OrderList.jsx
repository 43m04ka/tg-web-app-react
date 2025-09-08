import React from 'react';
import BlockLabel from "../../Elements/BlockLabel";
import style from "./History.module.scss";
import ButtonLabel from "../../Elements/ButtonLabel";

const OrderList = ({orderList, setOrderId}) => {

    const [selectedId, setSelectedId] = React.useState(-1);

    return (
        <div>
            <BlockLabel label={'Список'}>
                {orderList.length > 0 ?
                    <div className={style['order-choice-main']}>
                        {orderList.map(item => (
                        <div className={`${style['order-choice-block']}  ${style['order-choice-'+(selectedId === item.id ? 'active' : '')]}`}
                             onClick={() => {
                                 setSelectedId(item.id);
                                 setOrderId(item.id);
                             }}>
                            <div className={style['order-choice-label']}>{'№'+item.id}</div>
                            <div className={style['order-choice-label']}>{(new Date(item.createdAt)).toLocaleDateString()}</div>
                            <div className={style['order-choice-label']}>{item.summa + '₽'}</div>
                            <div className={style['order-choice-label']}>{selectedId === item.id ? '>Выбрано<' : '>Выбрать<'}</div>
                        </div>
                    ))}
                    </div>
                    :
                    <div className={style['order-choice-empty']}>Нет заказов по данному id или дате</div>}
            </BlockLabel>
        </div>
    );
};

export default OrderList;