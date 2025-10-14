import React, {useEffect, useState} from 'react';
import {useServer} from "./useServer";
import CardList from "./CardList";
import useGlobalData from "../../../../../../hooks/useGlobalData";
import useData from "../../useData";
import List from "../../Elements/List/List";
import style from "../Promo/Promo.module.scss";
import ButtonLine from "../../Elements/ButtonLine/ButtonLine";
import PopUpWindow from "../../Elements/PopUpWindow/PopUpWindow";
import InputLabel from "../../Elements/Input/InputLabel";
import DropBox from "../../Elements/DropBox/DropBox";
import ButtonLabel from "../../Elements/ButtonLabel";

const EditDirectories = () => {
    const {createCatalog, deleteCatalog, changeSaleStatusCatalog} = useServer();

    const [listButtonData, setListButtonData] = useState([
        {name: 'Обновить', status: true, key: 'reload'},
        {name: 'Удалить', status: false, key: 'delete'},
        {name: 'Раскрыть список карт', status: false, key: 'openList'},
        {name: 'Включить в продажу', status: false, key: 'changeStatusTrue'},
        {name: 'Убрать с продажи', status: false, key: 'changeStatusFalse'},
    ])

    const [selectList, setSelectList] = useState([]);

    if (listButtonData[2].status !== (selectList.length === 1)) {
        let newValue = listButtonData
        newValue[1].status = selectList.length === 1;
        newValue[2].status = selectList.length === 1;
        newValue[3].status = selectList.length === 1;
        newValue[4].status = selectList.length === 1;
        setListButtonData(listButtonData);
    }


    const {authenticationData} = useData()
    const {catalogList, pageList, updateCatalogList, updatePageList} = useGlobalData()

    const [selectedCatalogId, setSelectedCatalogId] = useState(-1);
    const [openListCards, setOpenListCards] = React.useState(false);
    const [createTabOpen, setCreateTabOpen] = React.useState(false);
    const [pathNewCatalog, setPathNewCatalog] = useState('')
    const [pageNewCatalog, setPageNewCatalog] = useState('')

    //---------------------

    const cap = {
        name: ['Путь', 'Страница', 'Статуc'],
        key: ['path', (item) => {
            return (pageList.map(page => {
                return (page.id === item.structurePageId ? page.name : null)
            }).filter(el => el !== null)[0])
        }, 'onSale'],
    }

    const positionOptionsList = {
        name: [],
        key: [],
    }

    const returnOptionsButtonLine = (option) => {
        switch (option) {
            case 'reload':
                updateCatalogList()
                break;
            case 'openList':
                setOpenListCards(true)
                setSelectedCatalogId(selectList[0])
                break;
            case 'changeStatusTrue':
                changeSaleStatusCatalog(() => {
                    updateCatalogList()
                }, authenticationData, selectList[0], true).then()
                break;
            case 'changeStatusFalse':
                changeSaleStatusCatalog(() => {
                    updateCatalogList()
                }, authenticationData, selectList[0], false).then()
                break;
            case 'delete':
                deleteCatalog(() => {
                    updateCatalogList()
                }, authenticationData, selectList[0]).then();
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        updatePageList(true)
    }, [])

    return (
        <div className={style['mainContainer']}>
            <div className={style['header']}>
                <div className={style['flexRow'] + ' ' + style['alignItemsCenter']}>
                    <div className={style['headerTitle']}>Каталоги</div>
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
            <List listData={catalogList.sort((a, b) => a.structurePageId - b.structurePageId) || []} cap={cap}
                  positionOptions={positionOptionsList}
                  returnOption={() => {
                  }} setSelectList={setSelectList} selectList={selectList}
                  checkBoxType={'simply'}/>
            {selectedCatalogId !== -1 && openListCards ? (<div>
                <CardList catalogId={selectedCatalogId} onReload={() => updateCatalogList()} onClose={() => {
                    setOpenListCards(false)
                }}/>
            </div>) : ''}

            {createTabOpen ? (<div>
                <PopUpWindow title={'Создать каталог'}>
                    <div>
                        <InputLabel placeholder={'xbox_new'} label={'Путь до каталога'}
                                    onChange={(event) => setPathNewCatalog(event.target.value)}/>
                        <DropBox label={pageList.map(page => {
                            page.label = page.name;
                            return page
                        })} onChange={(result) => setPageNewCatalog(pageList[result].id)}/>
                    </div>
                    <div className={style['buttonPlace']}>
                        <div className={style['buttonAccept']}
                             onClick={async () => {
                                 await createCatalog(() => {
                                     updateCatalogList()
                                 }, authenticationData, pathNewCatalog, pageNewCatalog);
                                 updateCatalogList()
                                 setCreateTabOpen(false);
                             }}>
                            <div/>
                            <p>Создать</p>
                        </div>

                        <div className={style['buttonCancel']} onClick={() => {
                            setCreateTabOpen(false);
                        }}>
                            <div/>
                            <p>Отмена</p>
                        </div>
                    </div>
                </PopUpWindow>
            </div>) : ''}
        </div>)

};

export default EditDirectories;


// {catalogList.length === 0 ? (<div className={styles['catalog-choice-empty']}>
//     Нет загруженных каталогов
// </div>) : catalogList.map(catalog => (<div
//     className={`${styles['catalog-choice-block']} ${selectedCatalogId === catalog.id ? styles['catalog-choice-active'] : ''}`}
//     key={catalog.path} onClick={() => setSelectedCatalogId(catalog.id)}>
//     <div className={styles['catalog-choice-label']}>
//         {(catalog.isExchangeIndiaCatalog ? '₹ ' : '') + catalog.path}</div>
//     <div
//         className={`${styles['catalog-choice-label']} ${styles['catalog-choice-status-' + String(catalog.onSale)]}`}>
//         {catalog.onSale}</div>
//     <div
//         className={styles['catalog-choice-btn']}>
//         {selectedCatalogId === catalog.id ? '> Выбран ˂' : '» Выбрать «'}</div>
// </div>))}


// <div style={{display: "flex", flexDirection: 'column'}}>
//     <BlockLabel label={'Создать каталог'}>
//         <InputLabel placeholder={'xbox_new'} label={'Путь до каталога'}
//                     onChange={(event) => setPathNewCatalog(event.target.value)}/>
//         <DropBox label={pageList.map(page => {
//             page.label = page.name;
//             return page
//         })} onChange={(result) => setPageNewCatalog(pageList[result].id)}/>
//         <ButtonLabel label={'Создать каталог'} onClick={createNewCatalog}/>
//     </BlockLabel>
//     {selectedCatalogId !== -1 ? (<BlockLabel label={'Действие'}>
//         <SwitchLabel label={['Скрыть список карт', 'Раскрыть список карт']}
//                      onChange={setOpenListCards}/>
//         <ButtonLabel label={'Использовать как обмен для индии'} onClick={() => {
//             setExchangeIndiaCatalog(authenticationData, selectedCatalogId).then()
//             getCatalogList(setCatalogList).then()
//         }}/>
//         <SeparatorLabel label={'Изменить статус'}/>
//         <ButtonLabel label={'Выставить в продажу'}
//                      onClick={() => changeSaleStatusCatalog(() => getCatalogList(setCatalogList).then(),
//                          authenticationData, selectedCatalogId, true)}/>
//         <ButtonLabel label={'Убрать с продажи'}
//                      onClick={() => changeSaleStatusCatalog(() => getCatalogList(setCatalogList).then(),
//                          authenticationData, selectedCatalogId, false)}/>
//         <SeparatorLabel/>
//         <ButtonLabel label={'Удалить'} onClick={() => {
//             deleteCatalog(setCatalogList, authenticationData, selectedCatalogId).then()
//             setSelectedCatalogId(-1)
//             setOpenListCards(false)
//         }}/>
//     </BlockLabel>) : ''}
// </div>