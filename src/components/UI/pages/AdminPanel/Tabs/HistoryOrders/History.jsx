import React, {useEffect, useState} from 'react';
import {useServer} from "./useServer";
import useGlobalData from "../../../../../../hooks/useGlobalData";
import style from "./History.module.scss";
import ButtonLine from "../../Elements/ButtonLine/ButtonLine";
import List from "../../Elements/List/List";
import Order from "./Order";

const History = () => {

    const [historyList, setHistoryList] = React.useState([]);
    const {getHistoryList} = useServer()

    const [listButtonData, setListButtonData] = useState([
        {name: 'Подробнее', status: false, key: 'info'},
    ])

    const [infoTabOpen, setInfoTabOpen] = useState(false);
    const [orderId, setOrderId] = React.useState(-1);
    const [selectList, setSelectList] = useState([]);

    if (listButtonData[0].status !== (selectList.length === 1)) {
        let newValue = listButtonData
        newValue[0].status = selectList.length === 1;
        setListButtonData(listButtonData);
    }

    const cap = {
        name: ['Id', 'Сумма', 'Дата',],
        key: ['id', 'summa', (item) => {
            return (new Date(item['createdAt'])).toLocaleString()
        }],
    }

    const positionOptionsList = {
        name: ['Подробнее'],
        key: ['info'],
    }

    const returnOptionsButtonLine = (option) => {
        switch (option) {
            case 'info':
                setInfoTabOpen(true)
                setOrderId(selectList[0])
                break;
            default:
                break;
        }
    }

    const returnOptionList = (option, id) => {
        switch (option) {
            case 'info':
                setInfoTabOpen(true)
                setOrderId(id)
                break;
            default:
                break;
        }
    }

    return (
        <div className={style['mainContainer']}>
            <div className={style['header']}>
                <div className={style['flexRow'] + ' ' + style['alignItemsCenter']}>
                    <div className={style['headerTitle']}>История заказов</div>
                </div>
                <div className={style['flexRow'] + ' ' + style['alignItemsCenter']}>
                    <input className={style['inputFind']} placeholder={'Поиск {32 или 2025.8.24}'}
                           onChange={async (event) => {
                              await getHistoryList(setHistoryList, event.target.value);
                              setSelectList([])
                           }}/>
                    <ButtonLine listButtonData={listButtonData} returnOptions={returnOptionsButtonLine}/>
                </div>
            </div>

            {historyList !== null ? (
                <List listData={historyList} cap={cap} positionOptions={positionOptionsList}
                      returnOption={returnOptionList} setSelectList={setSelectList} selectList={selectList}
                      checkBoxType={'simply'}/>) : ''}

            {infoTabOpen ? <Order onClose={() => {
                setInfoTabOpen(false);
            }} updatePageList={() => updatePageList(true)} orderId={orderId}/> : ''}
        </div>);

};

export default History;

