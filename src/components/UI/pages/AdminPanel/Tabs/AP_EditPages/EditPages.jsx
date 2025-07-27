import React, {useRef, useState} from 'react';
import {useServer} from "../../useServer";
import useGlobalData from "../../../../../../hooks/useGlobalData";
import BlockLabel from "../../Elements/BlockLabel";
import InputLabel from "../../Elements/InputLabel";
import ButtonLabel from "../../Elements/ButtonLabel";
import useData from "../../useData";
import styles from "./EditPage.module.scss";

const EditPages = () => {

    const {pageList, updatePageList} = useGlobalData()
    const {authenticationData} = useData()
    const [pageId, setPageId] = useState(-1)

    const [updatePageJson, setUpdatePageJson] = useState({})

    const [inputNameCreatePage, setInputNameCreatePage] = useState(null)
    const [inputLinkCreatePage, setInputLinkCreatePage] = useState(null)
    const [inputNumberCreatePage, setInputNumberCreatePage] = useState(null)
    const [inputUrlCreatePage, setInputUrlCreatePage] = useState(null)
    const [inputColorCreatePage, setInputColorCreatePage] = useState(null)

    const {createPage, updatePageData} = useServer()

    return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <div>
                <BlockLabel label={'Создать страницу'}>
                    <InputLabel onChange={(e) => {
                        setInputNameCreatePage(e.target.value)
                    }} label={'Имя'} placeholder={'PLAYSTATION'}/>
                    <InputLabel onChange={(e) => {
                        setInputLinkCreatePage(e.target.value)
                    }} label={'Ссылка'} placeholder={'playstation'}/>
                    <InputLabel onChange={(e) => {
                        setInputColorCreatePage(e.target.value)
                    }} label={'Цвет'} placeholder={'#78FF12'}/>
                    <InputLabel onChange={(e) => {
                        setInputUrlCreatePage(e.target.value)
                    }} label={'Изображение'} placeholder={'https://i.postimg.cc...'}/>
                    <InputLabel onChange={(e) => {
                        setInputNumberCreatePage(e.target.value)
                    }} label={'Порядковый номер'} placeholder={'2'}/>
                    <ButtonLabel label={'Создать страницу'} onClick={() => {
                        //создание страницы
                        updatePageList()
                    }}/>
                </BlockLabel>
                <BlockLabel label={'Выбор страницы'} onReload={() => updatePageList()}>
                    {pageList.map((page, index) => (<div
                        className={`${styles['page-choice-block']} ${pageId === index ? styles['page-choice-active'] : ''}`}
                        key={page.id} onClick={() => setPageId(index)}>
                        <div className={styles['page-choice-label']}>
                            {page.name}</div>
                        <div
                            className={styles['page-choice-btn']}>
                            {pageId === index ? '> Выбран ˂' : '» Выбрать «'}</div>
                    </div>))}
                </BlockLabel>
            </div>
            {pageId !== -1 ? (
                <BlockLabel label={'Редактирование страницы'}>
                    <InputLabel label={'Имя'} placeholder={pageList[pageId].name}
                                onChange={(e) => {
                                    let newJson = updatePageJson
                                    newJson['name'] = e.target.value;
                                    setUpdatePageJson(newJson);
                                }}/>
                    <InputLabel label={'Ссылка'} placeholder={pageList[pageId].link}
                                onChange={(e) => {
                                    let newJson = updatePageJson
                                    newJson['link'] = e.target.value;
                                    setUpdatePageJson(newJson);
                                }}/>
                    <InputLabel label={'Изображение'} placeholder={pageList[pageId].url}
                                onChange={(e) => {
                                    let newJson = updatePageJson
                                    newJson['url'] = e.target.value;
                                    setUpdatePageJson(newJson);
                                }}/>
                    <InputLabel label={'Порядковый номер'} placeholder={pageList[pageId].serialNumber}
                                onChange={(e) => {
                                    let newJson = updatePageJson
                                    newJson['serialNumber'] = e.target.value;
                                    setUpdatePageJson(newJson);
                                }}/>
                    <InputLabel label={'Цвет'} placeholder={pageList[pageId].color}
                                onChange={(e) => {
                                    let newJson = updatePageJson
                                    newJson['color'] = e.target.value;
                                    setUpdatePageJson(newJson);
                                }}/>
                    <ButtonLabel label={'Сохранить'}
                                 onClick={() =>
                                     updatePageData(() => updatePageList(), authenticationData, pageList[pageId].id, updatePageJson)}/>
                    <ButtonLabel label={'Удалить'}/>
                </BlockLabel>
            ) : ''}
        </div>
    )
};

export default EditPages;
