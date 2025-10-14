import React, {useEffect, useState} from 'react';
import useData from "../../../../useData";
import {useServer} from "../../useServer";
import style from "../../Structure.module.scss";
import ButtonLine from "../../../../Elements/ButtonLine/ButtonLine";
import List from "../../../../Elements/List/List";
import CreateBody from "./CreateBody";

const Body = ({catalogBodyList, page, onReload}) => {

    const [listButtonData, setListButtonData] = useState([
        {name: 'Обновить', status: true, key: 'reload'},
        {name: 'Удалить', status: false, key: 'delete'}
    ])

    const [createTabOpen, setCreateTabOpen] = useState(false);
    const [selectList, setSelectList] = useState([]);
    const {deleteStructureCatalog}= useServer()

    if (listButtonData[1].status !== selectList.length > 0) {
        let newValue = listButtonData
        newValue[1].status = selectList.length > 0;
        setListButtonData(listButtonData);
    }

    const {authenticationData} = useData();

    const cap = {
        name: ['Тип', 'Имя', 'Путь', 'Порядковый №'],
        key: [((item)=>{return item['type'].includes('banner') ? 'Баннер' : 'Каталог'}), 'name', 'path', 'serialNumber'],
    }

    const positionOptionsList = {
        name: ['Удалить'],
        key: ['delete'],
    }

    const returnOptionsButtonLine = (option) => {
        switch (option) {
            case 'reload':
                onReload();
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
        await deleteStructureCatalog(authenticationData, listId[0]).then()
        await onReload();
    }

    return (<div className={style['mainContainer']}>
        <div className={style['header']}>
            <div className={style['flexRow'] + ' ' + style['alignItemsCenter']}>
                <div className={style['headerTitle']}>Тело</div>
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

        {catalogBodyList !== null ? (
            <List listData={catalogBodyList} cap={cap} positionOptions={positionOptionsList}
                  returnOption={returnOptionList} setSelectList={setSelectList} selectList={selectList}
                  checkBoxType={'any'}/>) : ''}
        {createTabOpen ? <CreateBody onClose={() => {
            setCreateTabOpen(false);
        }} onReload = {onReload} page={page}/> : ''}
    </div>);
};

export default Body;