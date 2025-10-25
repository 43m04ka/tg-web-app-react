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
        {name: 'Копировать', status: false, key: 'copy'},
        {name: 'Удалить', status: false, key: 'delete'}
    ])

    const [copyData, setCopyData] = useState({})

    const [createTabOpen, setCreateTabOpen] = useState(false);
    const [selectList, setSelectList] = useState([]);
    const {deleteStructureCatalog} = useServer()

    if (listButtonData[1].status !== selectList.length > 0) {
        let newValue = listButtonData
        newValue[1].status = selectList.length > 0;
        newValue[2].status = selectList.length > 0;
        setListButtonData(listButtonData);
    }

    const {authenticationData} = useData();

    const cap = {
        name: ['Тип', 'Имя', 'Путь', 'Порядковый №'],
        key: [((item) => {
            return item['type'].includes('banner') ? 'Баннер' : 'Каталог'
        }), ((item) => {
            return item['type'].includes('banner') ? item.url : item.name
        }), 'path', 'serialNumber'],
    }

    const positionOptionsList = {
        name: ['Копировать', 'Удалить'],
        key: ['copy','delete'],
    }

    const returnOptionsButtonLine = (option) => {
        switch (option) {
            case 'reload':
                onReload();
                break;
            case 'delete':
                onDelete(selectList).then();
                break;
            case 'copy':
                setCopyData(catalogBodyList.map(item=>{
                    let id = selectList[0]
                    return item.id === id ? item : null
                }).filter(item => item !== null)[0])
                setCreateTabOpen(true);
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
            case 'copy':
                setCopyData(catalogBodyList.map(item=>{
                    return item.id === id ? item : null
                }).filter(item => item !== null)[0])
                setCreateTabOpen(true);
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
        <div className={style['header']} style={{marginTop:'0px', marginBottom:'0px'}}>

            <div className={style['flexRow'] + ' ' + style['alignItemsCenter']}>

                <div className={style['buttonCreate']} onClick={() => {
                    setCopyData({})
                    setCreateTabOpen(true);
                }}>
                    <div/>
                    <p>Создать</p>
                </div>

                <ButtonLine listButtonData={listButtonData} returnOptions={returnOptionsButtonLine}/>

                <div className={style['headerTitle']} style={{margin: '0 20px'}}>Тело</div>
            </div>
        </div>

        {catalogBodyList !== null ? (
            <List listData={catalogBodyList} cap={cap} positionOptions={positionOptionsList}
                  returnOption={returnOptionList} setSelectList={setSelectList} selectList={selectList}
                  checkBoxType={'simply'}/>) : ''}
        {createTabOpen ? <CreateBody onClose={() => {
            setCreateTabOpen(false);
        }} onReload={onReload} page={page} copyData={copyData}/> : ''}
    </div>);
};

export default Body;