import React, {useEffect, useState} from 'react';
import {useServer} from "./useServer";
import useData from "../../useData";
import style from './InfoBlock.module.scss'
import List from "../../Elements/List/List";
import CreateInfoBlock from "./CreateInfoBlock";
import ButtonLine from "../../Elements/ButtonLine/ButtonLine";

const InfoBlock = () => {

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
    const {getInfoBlock, deleteInfoBlock} = useServer()

    const cap = {
        name: ['Имя', 'Заголовок', 'Тело'],
        key: ['name', 'name', 'body'],
    }

    const positionOptionsList = {
        name: ['Удалить'],
        key: ['delete'],
    }

    const returnOptionsButtonLine = (option) => {
        switch (option) {
            case 'reload':
                getInfoBlock(setPromoList).then()
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
            await deleteInfoBlock(authenticationData, id).then()
        }
        await getInfoBlock(setPromoList).then()
        await setSelectList([])
    }

    useEffect(() => {
        if (promoList === null) {
            getInfoBlock(setPromoList).then()
        }
    }, [getInfoBlock]);

    return (<div className={style['mainContainer']}>
        <div className={style['header']}>
            <div className={style['flexRow'] + ' ' + style['alignItemsCenter']}>
                <div className={style['headerTitle']}>Акции и спецпредложения</div>
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
        {createTabOpen ? <CreateInfoBlock onClose={() => {
            setCreateTabOpen(false);
        }} setPromoList={setPromoList}/> : ''}
    </div>);
};

export default InfoBlock;