import React, {useState} from 'react';
import '../../../../../styles/style.css';
import {useTelegram} from "../../../../../../hooks/useTelegram";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import styles from "./CardList.module.scss";
import {useServer} from "../../useServer";
import EditDataCard from "../EditCards/EditData/EditDataCard";
import PopUpWindow from "../../Elements/PopUpWindow/PopUpWindow";
import List from "../../Elements/List/List";
import style from "../Promo/Promo.module.scss";
import ButtonLine from "../../Elements/ButtonLine/ButtonLine";
import useData from "../../useData";

const CardList = ({catalogId, onReload, onClose}) => {

    const [cardList, setCardList] = useState([])
    const [currentCatalogId, setCurrentCatalogId] = useState('')
    const [maxLength, setMaxLength] = useState(0)
    const [listNumber, setListNumber] = useState(1);
    const [cardId, setCardId] = useState(-1);
    const [editTabOpen, setEditTabOpen] = useState(false);

    const {tg} = useTelegram();
    const {updateCardData, getCardList} = useServer()
    const {authenticationData} = useData()
    const navigate = useNavigate();

    const setResult = (result) => {
        setCardList(result.cardList);
        setMaxLength(result.len);
    }

    if (currentCatalogId !== catalogId) {
        setCurrentCatalogId(catalogId);
        getCardList(setResult, catalogId, 1).then();
    }

    useEffect(() => {
        tg.BackButton.show();
        tg.onEvent('backButtonClicked', () => navigate(-1))
        return () => {
            tg.offEvent('backButtonClicked', () => navigate(-1))
        }
    }, [])


    const [listButtonData, setListButtonData] = useState([
        {name: 'Обновить', status: true, key: 'reload'},
        {name: 'Изменить', status: false, key: 'edit'},
        {name: 'Включить в продажу', status: false, key: 'changeStatusTrue'},
        {name: 'Убрать с продажи', status: false, key: 'changeStatusFalse'},
    ])

    const [selectList, setSelectList] = useState([]);

    if (listButtonData[1].status !== (selectList.length === 1)) {
        let newValue = listButtonData
        newValue[1].status = selectList.length === 1;
        setListButtonData(listButtonData);
    }

    if (listButtonData[2].status !== (selectList.length > 0)) {
        let newValue = listButtonData
        newValue[2].status = selectList.length > 0;
        newValue[3].status = selectList.length > 0;
        setListButtonData(listButtonData);
    }

    const cap = {
        name: ['Имя', 'Id', 'Цена', 'Статус'],
        key: ['name', 'id', 'price', (item) => {
            return item.onSale ? 'В продаже' : 'Нет в продаже'
        }],
    }

    const positionOptionsList = {
        name: ['Изменить'],
        key: ['edit'],
    }

    const returnOptionsButtonLine = (option) => {
        switch (option) {
            case 'edit':
                setEditTabOpen(true)
                setCardId(selectList[0])
                break;
            case 'changeStatusFalse':
                onChangeStatus(selectList, false).then()
                break;
            case 'changeStatusTrue':
                onChangeStatus(selectList, true).then()
                break;
            case 'reload':
                getCardList(setResult, catalogId, listNumber).then();
                break;
            default:
                break;
        }
    }

    const returnOptionList = (option, id) => {
        switch (option) {
            case 'edit':
                setEditTabOpen(true)
                setCardId(id)
                break;
            case 'changeStatusFalse':
                onChangeStatus([id], false).then()
                break;
            case 'changeStatusTrue':
                onChangeStatus([id], true).then()
                break;
            default:
                break;
        }
    }

    const onChangeStatus = async (listId, bool) => {
        for await (const id of listId) {
            await updateCardData(() => {
            }, authenticationData, id, {onSale: bool})
        }
        await getCardList(setResult, catalogId, 1).then();
    }


    return (<div><PopUpWindow title={'Список карт'} onReload={onReload}>
        <div className={style['header']}>
            <div className={style['flexRow'] + ' ' + style['alignItemsCenter']}>
                <ButtonLine listButtonData={listButtonData} returnOptions={returnOptionsButtonLine}/>
            </div>
        </div>
        <List listData={cardList || []} cap={cap} positionOptions={positionOptionsList}
              returnOption={returnOptionList} setSelectList={setSelectList} selectList={selectList}
              checkBoxType={'any'}/>
        <div className={styles['page-navigation']}>
            {listNumber > 1 ? <div onClick={() => {
                getCardList(setResult, currentCatalogId, listNumber - 1).then();
                setListNumber(listNumber - 1);
            }}>{'<'}</div> : ''}
            {listNumber > 1 ? <div onClick={() => {
                getCardList(setResult, currentCatalogId, 1).then();
                setListNumber(1);
            }}>{'1'}</div> : ''}
            <div className={styles['active-page']}>{listNumber}</div>
            {listNumber < maxLength ? <div onClick={() => {
                getCardList(setResult, currentCatalogId, maxLength).then();
                setListNumber(maxLength);
            }}>{maxLength}</div> : ''}
            {listNumber < maxLength ? <div onClick={() => {
                getCardList(setResult, currentCatalogId, listNumber + 1).then();
                setListNumber(listNumber + 1);
            }}>{'>'}</div> : ''}
        </div>
        <div className={style['buttonPlace']}>
            <div className={style['buttonCancel']} onClick={() => {
                onClose();
            }}>
                <div/>
                <p>Закрыть</p>
            </div>
        </div>
    </PopUpWindow>
        {editTabOpen ? <EditDataCard onClose={() => {
            setEditTabOpen(false);
        }} onReload={() => getCardList(setResult, catalogId, listNumber).then()} cardId={cardId}/> : ''}
    </div>);

};

export default CardList;


// {cardList.map(card => (<div key={card.id}
//                             className={`${styles['card-choice-block']}
//                                                         ${styles['card-choice-' + (selectedId === card.id ? 'active' : 'nonactive')]}`}
//                             onClick={() => setSelectedId(card.id)}>
//     <div className={styles['card-choice-label']}>{card.name}</div>
//     <div className={styles['card-choice-label']}>{card.price}</div>
//     <div className={styles['card-choice-label']}>{card.platform}</div>
//     <div
//         className={`${styles['card-choice-label']} ${styles['card-choice-status-' + String(card.onSale)]}`}>
//         {card.onSale ? 'В продаже' : 'Нет в продаже'}</div>
//     <div
//         className={styles['card-choice-btn']}>
//         {selectedId === card.id ? '> Редактирование ˂' : '» Редактировать «'}</div>
// </div>))}