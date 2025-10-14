import React, {useEffect, useRef, useState} from 'react';
import {useServer} from "../useServer";
import useGlobalData from "../../../../../../../hooks/useGlobalData";
import useData from "../../../useData";
import List from "../../../Elements/List/List";
import style from "../../Promo/Promo.module.scss";
import ButtonLine from "../../../Elements/ButtonLine/ButtonLine";
import EditPageData from "./EditPageData";

const EditPages = ({page, setPage}) => {

    const [listButtonData, setListButtonData] = useState([
        {name: 'Обновить', status: true, key: 'reload'},
        {name: 'Изменить', status: false, key: 'edit'},
        {name: 'Скрыть / Отобразить', status: false, key: 'changeStatus'},
    ])

    const {pageList, updatePageList} = useGlobalData()
    const {authenticationData} = useData()
    const {updatePageData} = useServer()
    const [pageId, setPageId] = useState(-1)
    const [editTabOpen, setEditTabOpen] = useState(false);

    const [selectList, setSelectList] = useState([]);

    if(page !== selectList[0]){
        setPage(selectList[0]);
    }

    if (listButtonData[1].status !== (selectList.length === 1)) {
        let newValue = listButtonData
        newValue[1].status = selectList.length === 1;
        newValue[2].status = selectList.length === 1;
        setListButtonData(listButtonData);
    }

    const cap = {
        name: ['Имя', 'Номер', 'Путь', 'Цвет', 'Иконка', 'Отображение'],
        key: ['name', 'serialNumber', 'link', 'color', 'url', (item)=>{return item['isHide'] === 1 ? 'Отображена' : 'Скрыта'}],
    }

    const positionOptionsList = {
        name: ['Изменить', 'Скрыть / Отобразить'],
        key: ['edit', 'changeStatus'],
    }

    const returnOptionsButtonLine = (option) => {
        switch (option) {
            case 'reload':
                updatePageList(true).then()
                break;
            case 'edit':
                setPageId(selectList[0])
                setEditTabOpen(true)
                break;
            case 'changeStatus':
                let pageData = {}
                pageList.map((item) => {
                    if(item.id === selectList[0]){
                        pageData = item;
                    }
                })
                updatePageData(authenticationData, selectList[0], {isHide: (pageData.isHide === 1 ? 0 : 1)}).then(()=>{updatePageList(true)})
                break;
            default:
                break;
        }
        setSelectList([])
    }

    const returnOptionList = (option, id) => {
        switch (option) {
            case 'edit':
                setPageId(id)
                setEditTabOpen(true)
                break;
            case 'changeStatus':
                let pageData = {}
                pageList.map((item) => {
                    if(item.id === id){
                        pageData = item;
                    }
                })
                updatePageData(authenticationData, id, {isHide: (pageData.isHide === 1 ? 0 : 1)}).then(()=>{updatePageList(true)})
                break;
            default:
                break;
        }
        setSelectList([])
    }

    useEffect(() => {
        updatePageList(true).then()
    }, [updatePageList]);

    return (
        <div className={style['mainContainer']}>
            <div className={style['header']}>
                <div className={style['flexRow'] + ' ' + style['alignItemsCenter']}>
                    <div className={style['headerTitle']}>Страницы</div>
                </div>
                <div className={style['flexRow'] + ' ' + style['alignItemsCenter']}>
                    <ButtonLine listButtonData={listButtonData} returnOptions={returnOptionsButtonLine}/>
                </div>
            </div>

            {pageList !== null ? (
                <List listData={pageList} cap={cap} positionOptions={positionOptionsList}
                      returnOption={returnOptionList} setSelectList={setSelectList} selectList={selectList}
                        checkBoxType={'simply'}/>) : ''}

            {editTabOpen ? <EditPageData onClose={() => {
                setEditTabOpen(false);
                setPageId(-1)
            }} updatePageList={()=>updatePageList(true)} id={pageId}/> : ''}
        </div>
    )
};

export default EditPages;
