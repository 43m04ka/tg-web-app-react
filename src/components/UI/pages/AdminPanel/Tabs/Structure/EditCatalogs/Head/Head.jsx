import React, {useState} from 'react';
import {useServer} from "../../useServer";
import useData from "../../../../useData";
import style from "../../Structure.module.scss";
import ButtonLine from "../../../../Elements/ButtonLine/ButtonLine";
import List from "../../../../Elements/List/List";
import CreateBody from "../Body/CreateBody";
import CreateHead from "./CreateHead";

const Head = ({catalogHeadList, page, onReload}) => {

    const [listButtonData, setListButtonData] = useState([
        {name: 'Обновить', status: true, key: 'reload'},
        {name: 'Копировать', status: false, key: 'copy'},
        {name: 'Удалить', status: false, key: 'delete'}
    ])

    const [copyData, setCopyData] = useState({})

    const [createTabOpen, setCreateTabOpen] = useState(false);
    const [selectList, setSelectList] = useState([]);
    const {deleteStructureCatalog}= useServer()

    if (listButtonData[1].status !== selectList.length > 0) {
        let newValue = listButtonData
        newValue[1].status = selectList.length > 0;
        newValue[2].status = selectList.length > 0;
        setListButtonData(listButtonData);
    }

    const {authenticationData} = useData();

    const cap = {
        name: ['Тип','Путь', 'Изображение', 'Порядковый №'],
        key: [((item)=>{return item['type'].includes('slider') ? 'Слайдер' : 'Иное'}), 'path','url', 'serialNumber'],
    }

    const positionOptionsList = {
        name: ['Копировать','Удалить'],
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
                setCopyData(catalogHeadList.map(item=>{
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
                setCopyData(catalogHeadList.map(item=>{
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
                    setCreateTabOpen(true);
                }}>
                    <div/>
                    <p>Создать</p>
                </div>

                <ButtonLine listButtonData={listButtonData} returnOptions={returnOptionsButtonLine}/>

                <div className={style['headerTitle']} style={{margin: '0 20px'}}>Карусель</div>
            </div>
        </div>

        {catalogHeadList !== null ? (
            <List listData={catalogHeadList} cap={cap} positionOptions={positionOptionsList}
                  returnOption={returnOptionList} setSelectList={setSelectList} selectList={selectList}
                  checkBoxType={'simply'}/>) : ''}
        {createTabOpen ? <CreateHead onClose={() => {
            setCreateTabOpen(false);
        }} onReload = {onReload} page={page}/> : ''}
    </div>);
};

export default Head;