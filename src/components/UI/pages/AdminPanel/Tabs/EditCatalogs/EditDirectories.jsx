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
import SwitchLabel from "../../Elements/SwitchLabel/SwitchLabel";

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
    const [parsingCatalogPlaystation, setParsingCatalogPlaystation] = useState(0)
    const [newCatalogData, setNewCatalogData] = useState({structurePageId: pageList[0].id, type:'DEFAULT'})

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
                                    onChange={(event) => {
                                        let newData = newCatalogData
                                        newData.path = event.target.value
                                        setNewCatalogData(newData)
                                    }}/>
                        <DropBox label={pageList.map(page => {
                            page.label = page.name;
                            return page
                        })} onChange={(result) => {
                            let newData = newCatalogData
                            newData.structurePageId = pageList[result].id
                            setNewCatalogData(newData)
                        }}/>
                        <SwitchLabel label={'Пропарсить каталог с сайта PlaystationStore'}
                                     onChange={(value) => {
                                         setParsingCatalogPlaystation(value.target.checked)

                                         let newData = newCatalogData
                                         newData.type = value.target.checked ? 'PLAYSTATION' : 'DEFAULT'
                                         setNewCatalogData(newData)
                                     }}/>
                        {parsingCatalogPlaystation ?
                            <div>
                                <InputLabel label={'ID каталога с сайта PlaystationStore'}
                                            onChange={(event) => {
                                                let newData = newCatalogData
                                                newData.playstationCatalogId = event.target.value
                                                setNewCatalogData(newData)
                                            }}/>
                                <InputLabel label={'Количество страниц в каталоге на сайте PlaystationStore'}
                                            onChange={(event) => {
                                                let newData = newCatalogData
                                                newData.playstationCountPages = event.target.value
                                                setNewCatalogData(newData)
                                            }}/>
                            </div>
                            : ''}
                    </div>
                    <div className={style['buttonPlace']}>
                        <div className={style['buttonAccept']}
                             onClick={async () => {
                                 await createCatalog(() => {
                                     updateCatalogList()
                                 }, authenticationData, newCatalogData);
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