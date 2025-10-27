import React, {useEffect, useRef, useState} from 'react';
import useGlobalData from "../../../../../../hooks/useGlobalData";
import ButtonLine from "../../Elements/ButtonLine/ButtonLine";
import {useServer} from "./useServer";
import List from "../../Elements/List/List";
import style from './Search.module.scss'
import PopUpWindow from "../../Elements/PopUpWindow/PopUpWindow";
import InputLabel from "../../Elements/Input/InputLabel";
import useData from "../../useData";


const Search = () => {

    const {pageList} = useGlobalData()
    const {authenticationData} = useData()
    const {getClueList, createClue, deleteClue} = useServer()

    const [page, setPage] = useState(-1);
    const [clueList, setClueList] = useState([]);
    const [selectList, setSelectList] = useState([]);
    const [createTabOpen, setCreateTabOpen] = useState(false);
    const [inputName, setInputName] = useState("");
    const [listButtonData, setListButtonData] = useState([
        {name: 'Обновить', status: true, key: 'reload'},
        {name: 'Удалить', status: false, key: 'delete'}
    ])

    if (listButtonData[1].status !== selectList.length > 0) {
        let newValue = listButtonData
        newValue[1].status = selectList.length > 0;
        setListButtonData(listButtonData);
    }

    useEffect(() => {
        getClueList(setClueList).then()
    }, [])

    const cap = {
        name: ['Имя'],
        key: ['name'],
    }

    const positionOptionsList = {
        name: ['Удалить'],
        key: ['delete'],
    }

    const returnOptionsButtonLine = (option) => {
        switch (option) {
            case 'reload':
                getClueList(setClueList).then()
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
            await deleteClue(authenticationData, id).then()
        }
        setTimeout(() => getClueList(setClueList).then(), 150)
        await setSelectList([])
    }


    return (<div className={style['mainContainer']}>
        <div className={style['header']}>
            <div className={style['flexRow'] + ' ' + style['alignItemsCenter']}>
                <div className={style['headerTitle']}>Подсказки в поиске</div>
            </div>
            <div className={style['flexRow'] + ' ' + style['alignItemsCenter']}>
                <div className={style['buttonCreate']} style={{background:page !== -1 ? '#5b78e3' : '#4c4a4a'}} onClick={() => {
                    if(page !== -1) {
                        setCreateTabOpen(true);
                    }
                }}>
                    <div/>
                    <p>Создать</p>
                </div>
                <ButtonLine listButtonData={pageList.map(el => {
                    return {name: el.titleForMessage, status: true, key: el.id, color: el.id === page ? '#5b78e3' : 'white'}
                })} returnOptions={(option) => {
                    setPage(option)
                }}/>
                <div style={{marginLeft: '15px'}}>
                    <ButtonLine listButtonData={listButtonData}
                                returnOptions={returnOptionsButtonLine}/>
                </div>
            </div>
        </div>
        <List listData={clueList.map(el=>{
            return el.structurePageId === page ? el : null
        }).filter(el => el !== null)} cap={cap} positionOptions={positionOptionsList}
              returnOption={returnOptionList} setSelectList={setSelectList} selectList={selectList}
              checkBoxType={'any'}/>

        {createTabOpen ? <PopUpWindow title={'Создать подсказку'}>
            <div>
                <InputLabel onChange={(e) => {
                    setInputName(e.target.value)
                }} label={'Имя'}/>
            </div>
            <div className={style['buttonPlace']}>
                <div className={style['buttonAccept']} onClick={async () => {

                    await createClue(authenticationData, {
                        name: inputName,
                        structurePageId: page,
                    }).then(() => setTimeout(() => getClueList(setClueList).then(), 150))
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
        </PopUpWindow> : ''}
    </div>);


};

export default Search;

