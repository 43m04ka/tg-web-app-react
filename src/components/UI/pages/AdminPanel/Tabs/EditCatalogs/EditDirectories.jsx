import React, {useState} from 'react';
import {useServer} from "../../useServer";
import BlockLabel from "../../Elements/BlockLabel";
import styles from './EditDirectories.module.scss'
import ButtonLabel from "../../Elements/ButtonLabel";
import SeparatorLabel from "../../Elements/SeparatorLabel";
import SwitchLabel from "../../Elements/SwitchLabel";
import CardList from "./CardList";
import InputLabel from "../../Elements/InputLabel";
import DropLabel from "../../Elements/DropLabel";
import useGlobalData from "../../../../../../hooks/useGlobalData";
import useData from "../../useData";

const EditDirectories = () => {
    const {getCatalogList, createCatalog, changeSaleStatusCatalog, deleteCatalog} = useServer();
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
                        <DropLabel label={pageList.map(page => {page.label = page.name; return page})} onChange={(result) => setPageNewCatalog(pageList[result].id)}/>
                        <ButtonLabel label={'Создать каталог'} onClick={createNewCatalog}/>
                    </BlockLabel>
                    <BlockLabel label={'Выбор каталога'} onReload={() => getCatalogList(setCatalogList).then()}>
                        {catalogList.length === 0 ? (<div className={styles['catalog-choice-empty']}>
                            Нет загруженных каталогов
                        </div>) : catalogList.map(catalog => (<div
                            className={`${styles['catalog-choice-block']} ${selectedCatalogId === catalog.id ? styles['catalog-choice-active'] : ''}`}
                            key={catalog.path} onClick={() => setSelectedCatalogId(catalog.id)}>
                            <div className={styles['catalog-choice-label']}>
                                {catalog.path}</div>
                            <div
                                className={`${styles['catalog-choice-label']} ${styles['catalog-choice-status-' + String(catalog.onSale)]}`}>
                                {catalog.onSale}</div>
                            <div
                                className={styles['catalog-choice-btn']}>
                                {selectedCatalogId === catalog.id ? '> Выбран ˂' : '» Выбрать «'}</div>
                        </div>))}
                    </BlockLabel>
                    {selectedCatalogId !== -1 ? (<BlockLabel label={'Действие'}>
                        <SwitchLabel label={['Скрыть список карт', 'Раскрыть список карт']}
                                     onChange={setOpenListCards}/>
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
                {selectedCatalogId !== -1 && openListCards ? (<div>
                    <CardList catalogId={selectedCatalogId} onReload={() => getCatalogList(setCatalogList).then()}/>
                </div>) : ''}
            </div>)
    }
};

export default EditDirectories;

// return (
//     <div>
//         {dataCategory.map(category => {
//             let text
//             let styleButton
//             if (category.isSale) {
//                 text = 'Убрать с продажи'
//                 styleButton = {
//                     margin: '5px',
//                     borderRadius: '100px',
//                     padding: '5px',
//                     border: '0px',
//                 }
//             } else {
//                 text = 'Включить в продажу'
//                 styleButton = {
//                     margin: '5px',
//                     borderRadius: '100px',
//                     padding: '5px',
//                     border: '0px',
//                     background: '#ef7474',
//                     color: 'white'
//                 }
//             }
//
//             let text1
//             let styleButton1
//             let cardList = (<></>)
//
//             if (category.path === selectedPath) {
//                 text1 = 'Скрыть список карт'
//                 styleButton1 = {
//                     margin: '5px',
//                     borderRadius: '100px',
//                     padding: '5px',
//                     border: '0px',
//                     background: '#ef7474',
//                     color: 'white'
//                 }
//                 cardList = (<CardList path={category.path} onReload={onReload}/>)
//             } else {
//                 text1 = 'Раскрыть список карт'
//                 styleButton1 = {
//                     margin: '5px',
//                     borderRadius: '100px',
//                     padding: '5px',
//                     border: '0px',
//                 }
//             }
//
//             return (
//                 <div>
//                     <div style={{
//                         display: 'grid',
//                         gridTemplateColumns: '600px 200px 200px 100px',
//                         borderBottom: '1px solid gray',
//                         alignItems: 'center',
//                         justifyContent: 'left'
//                     }}>
//                         <div className={'title'}>{category.path}</div>
//                         <button onClick={async () => {
//                             await changeStatusCards(category.path, 'all')
//                             await getCategories(setDataCategory)
//                             await setSelectedPath(-1)
//                         }} style={styleButton}>{text}
//                         </button>
//
//                         <button onClick={async () => {
//                             if (category.path === selectedPath) {
//                                 setSelectedPath(-1)
//                             } else {
//                                 setSelectedPath(category.path)
//                             }
//                         }} style={styleButton1}>{text1}
//                         </button>
//
//                         <button onClick={async () => {
//                             await deleteCards(category.path, 'all')
//                             await getCategories(setDataCategory)
//                         }} style={{
//                             margin: '5px',
//                             borderRadius: '100px',
//                             padding: '5px',
//                             border: '0px',
//                         }}>Удалить
//                         </button>
//                     </div>
//                     {cardList}
//                 </div>
//             )
//         })}
//     </div>
// );