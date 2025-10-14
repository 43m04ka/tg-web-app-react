import React, {useState} from 'react';
import {useServer} from "../../useServer";
import BlockLabel from "../../Elements/BlockLabel";
import styles from './EditDirectories.module.scss'
import ButtonLabel from "../../Elements/ButtonLabel";
import SeparatorLabel from "../../Elements/SeparatorLabel";
import SwitchLabel from "../../Elements/SwitchLabel/SwitchLabel";
import CardList from "./CardList";
import InputLabel from "../../Elements/Input/InputLabel";
import DropBox from "../../Elements/DropBox/DropBox";
import useGlobalData from "../../../../../../hooks/useGlobalData";
import useData from "../../useData";

const EditDirectories = () => {
    const {getCatalogList, createCatalog, changeSaleStatusCatalog, deleteCatalog, setExchangeIndiaCatalog} = useServer();
    const {pageList} = useGlobalData();
    const {catalogList, setCatalogList, authenticationData} = useData()

    const [selectedCatalogId, setSelectedCatalogId] = useState(-1);
    const [openListCards, setOpenListCards] = React.useState(false);
    const [pathNewCatalog, setPathNewCatalog] = useState(null)
    const [pageNewCatalog, setPageNewCatalog] = useState(null)

    const createNewCatalog = () => {
        createCatalog(setCatalogList, authenticationData, pathNewCatalog, pageNewCatalog).then()
    }

    if (catalogList === null) {
        console.log(catalogList)
        getCatalogList(setCatalogList).then()
        return (<div className={'plup-loader'} style={{
            marginTop: '25px', marginLeft: '25px'
        }}></div>)
    } else {
        return (
            <div style={{display: "flex", flexDirection: 'row'}}>
                <div style={{display: "flex", flexDirection: 'column'}}>
                    <BlockLabel label={'Создать каталог'}>
                        <InputLabel placeholder={'xbox_new'} label={'Путь до каталога'}
                                    onChange={(event) => setPathNewCatalog(event.target.value)}/>
                        <DropBox label={pageList.map(page => {page.label = page.name; return page})} onChange={(result) => setPageNewCatalog(pageList[result].id)}/>
                        <ButtonLabel label={'Создать каталог'} onClick={createNewCatalog}/>
                    </BlockLabel>
                    {selectedCatalogId !== -1 ? (<BlockLabel label={'Действие'}>
                        <SwitchLabel label={['Скрыть список карт', 'Раскрыть список карт']}
                                     onChange={setOpenListCards}/>
                        <ButtonLabel label={'Использовать как обмен для индии'} onClick={()=>{
                            setExchangeIndiaCatalog(authenticationData, selectedCatalogId).then()
                            getCatalogList(setCatalogList).then()
                        }}/>
                        <SeparatorLabel label={'Изменить статус'}/>
                        <ButtonLabel label={'Выставить в продажу'}
                                     onClick={()=>changeSaleStatusCatalog(()=>getCatalogList(setCatalogList).then(),
                                         authenticationData, selectedCatalogId, true)}/>
                        <ButtonLabel label={'Убрать с продажи'}
                                     onClick={()=>changeSaleStatusCatalog(()=>getCatalogList(setCatalogList).then(),
                                         authenticationData, selectedCatalogId, false)}/>
                        <SeparatorLabel/>
                        <ButtonLabel label={'Удалить'} onClick={()=>{
                            deleteCatalog(setCatalogList, authenticationData, selectedCatalogId).then()
                            setSelectedCatalogId(-1)
                            setOpenListCards(false)
                        }}/>
                    </BlockLabel>) : ''}
                </div>
                <BlockLabel label={'Выбор каталога'} onReload={() => getCatalogList(setCatalogList).then()}>
                    {catalogList.length === 0 ? (<div className={styles['catalog-choice-empty']}>
                        Нет загруженных каталогов
                    </div>) : catalogList.map(catalog => (<div
                        className={`${styles['catalog-choice-block']} ${selectedCatalogId === catalog.id ? styles['catalog-choice-active'] : ''}`}
                        key={catalog.path} onClick={() => setSelectedCatalogId(catalog.id)}>
                        <div className={styles['catalog-choice-label']}>
                            {(catalog.isExchangeIndiaCatalog ? '₹ ' : '') + catalog.path}</div>
                        <div
                            className={`${styles['catalog-choice-label']} ${styles['catalog-choice-status-' + String(catalog.onSale)]}`}>
                            {catalog.onSale}</div>
                        <div
                            className={styles['catalog-choice-btn']}>
                            {selectedCatalogId === catalog.id ? '> Выбран ˂' : '» Выбрать «'}</div>
                    </div>))}
                </BlockLabel>
                {selectedCatalogId !== -1 && openListCards ? (<div>
                    <CardList catalogId={selectedCatalogId} onReload={() => getCatalogList(setCatalogList).then()}/>
                </div>) : ''}
            </div>)
    }
};

export default EditDirectories;