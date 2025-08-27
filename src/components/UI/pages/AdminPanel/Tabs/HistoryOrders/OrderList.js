import React from 'react';
import BlockLabel from "../../Elements/BlockLabel";
import style from "./History.module.scss";
import ButtonLabel from "../../Elements/ButtonLabel";
import SeparatorLabel from "../../Elements/SeparatorLabel";
import SwitchLabel from "../../Elements/SwitchLabel";

const OrderList = ({orderList}) => {

    const [selectedId, setSelectedId] = React.useState(-1);

    return (
        <div>
            <BlockLabel label={'Список'}>
                {orderList.length > 0 ?
                    <div className={style['order-choice-main']}>
                        {orderList.map(item => (
                        <div className={`${style['order-choice-block']}  ${style['order-choice-'+(selectedId === item.id ? 'active' : '')]}`} onClick={() => setSelectedId(item.id)}>
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
            {selectedId !== -1 ? (<BlockLabel>
                <SwitchLabel label={['Скрыть список позиций', 'Раскрыть список позиций']}/>
                <SeparatorLabel/>
                <ButtonLabel label={'Отправить напоминание'}/>
            </BlockLabel>):''}
        </div>
    );
};

export default OrderList;