import React, {useEffect, useState} from 'react';
import {useServer} from "./useServer";
import useData from "../../useData";
import style from './Promo.module.scss'
import List from "../../Elements/List/List";
import CreatePromo from "./CreatePromo";
import ButtonLine from "../../Elements/ButtonLine/ButtonLine";

const Promo = () => {

    const [listButtonData, setListButtonData] = useState([
        {name: 'Обновить', status: true, key: 'reload'},
        {name: 'Удалить', status: false, key: 'delete'}
    ])

    const [promoList, setPromoList] = useState(null);
    const [createTabOpen, setCreateTabOpen] = useState(false);
    const [selectList, setSelectList] = useState([]);

    if (listButtonData[1].status !== selectList.length > 0) {
        let newValue = listButtonData
        newValue[1].status = selectList.length > 0;
        setListButtonData(listButtonData);
    }

    const {authenticationData} = useData();
    const {getPromoList, deletePromo} = useServer()

    const cap = {
        name: ['Имя', 'Общее кол-во использований (шт.)', 'Личное кол-во использований (шт.)', 'Процент (%)'],
        key: ['name', 'totalNumberUses', 'personalNumberUses', 'percent'],
    }

    const positionOptionsList = {
        name: ['Удалить'],
        key: ['delete'],
    }

    const returnOptionsButtonLine = (option) => {
        switch (option) {
            case 'reload':
                getPromoList(authenticationData, setPromoList).then()
                break;
            case 'delete':
                onDelete(selectList).then();
                break;
            default:
                break;
        }
        setSelectList([])
    }

    const returnOptionList = (option, id) => {
        switch (option) {
            case 'delete':
                onDelete([id]).then();
                break;
            default:
                break;
        }
        setSelectList([])
    }

    const onDelete = async (listId) => {
        for await (const id of listId) {
            await deletePromo(authenticationData, id).then()
        }
        await getPromoList(authenticationData, setPromoList).then()
        await setSelectList([])
    }

    useEffect(() => {
        if (promoList === null) {
            getPromoList(authenticationData, setPromoList).then()
        }
    }, [getPromoList]);

    return (<div className={style['mainContainer']}>
        <div className={style['header']}>
            <div className={style['flexRow'] + ' ' + style['alignItemsCenter']}>
                <div className={style['headerTitle']}>Промокоды</div>
            </div>
            <div className={style['flexRow'] + ' ' + style['alignItemsCenter']}>
                <div className={style['buttonCreate']} onClick={() => {
                    setCreateTabOpen(true);
                }}>
                    <div/>
                    <p>Создать</p>
                </div>

                <ButtonLine listButtonData={listButtonData} returnOptions={returnOptionsButtonLine}/>

            </div>
        </div>

        {promoList !== null ? (
            <List listData={promoList} cap={cap} positionOptions={positionOptionsList}
                  returnOption={returnOptionList} setSelectList={setSelectList} selectList={selectList}
                  checkBoxType={'any'}/>) : ''}
        {createTabOpen ? <CreatePromo onClose={() => {
            setCreateTabOpen(false);
        }} setPromoList={setPromoList}/> : ''}
    </div>);
};

export default Promo;