import React from 'react';
import InputLabel from "../../Elements/InputLabel";
import BlockLabel from "../../Elements/BlockLabel";
import ButtonLabel from "../../Elements/ButtonLabel";
import {useServer} from "./useServer";
import OrderList from "./OrderList";
import Order from "./Order";

const History = () => {
    const [inputValue, setInputValue] = React.useState('');
    const [historyList, setHistoryList] = React.useState(null);
    const [orderId, setOrderId] = React.useState(-1);
    const {getHistoryList} = useServer()

    const search = async () => {
        await getHistoryList(setHistoryList, inputValue);
    }

    return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <div>
            <BlockLabel label={'Найти заказ'}>
                <InputLabel onChange={(event) => setInputValue(event.target.value)} label={'Номер или дата заказа'} placeholder={'Например {32} или {2025.8.24}'}/>
                <ButtonLabel label={'Поиск'} onClick={search}/>
            </BlockLabel>
            {historyList !== null ? (<OrderList orderList={historyList} setOrderId={setOrderId} />) : ''}
            </div>
            {orderId !== -1 ? (<Order orderId={orderId} />) : ''}
        </div>
    );
};

export default History;