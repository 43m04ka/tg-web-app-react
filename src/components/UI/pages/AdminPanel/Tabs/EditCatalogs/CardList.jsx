import React, {useState} from 'react';
import '../../../../../styles/style.css';
import {useTelegram} from "../../../../../../hooks/useTelegram";
import {useCallback, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import styles from "./CardList.module.scss";
import BlockLabel from "../../Elements/BlockLabel";
import {useServer} from "../../useServer";
import SeparatorLabel from "../../Elements/SeparatorLabel";
import EditCard from "../../Blocks/EditCard";

const CardList = ({catalogId}) => {

    const [cardList, setCardList] = useState(null)
    const [currentCatalogId, setCurrentCatalogId] = useState('')
    const [maxLength, setMaxLength] = useState(0)
    const [listNumber, setListNumber] = useState(1);
    const [selectedId, setSelectedId] = useState(-1);

    const {tg} = useTelegram();
    const {getCardList} = useServer();
    const navigate = useNavigate();

    const setResult = (result) => {
        setCardList(result.cardList);
        setMaxLength(result.len);
    }

    const onReload = () => getCardList(setResult, currentCatalogId, listNumber).then()

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

    if (cardList !== null) {
        return (<BlockLabel label={'Список карт'} onReload={onReload}>
            {cardList.length > 0 ? <div>
                    <div>
                        <div>
                            {cardList.map(card => (<div key={card.id}
                                                        className={`${styles['card-choice-block']} 
                                                        ${styles['card-choice-' + (selectedId === card.id ? 'active' : 'nonactive')]}`}
                                                        onClick={() => setSelectedId(card.id)}>
                                <div className={styles['card-choice-label']}>{card.name}</div>
                                <div className={styles['card-choice-label']}>{card.price}</div>
                                <div className={styles['card-choice-label']}>{card.platform}</div>
                                <div
                                    className={`${styles['card-choice-label']} ${styles['card-choice-status-' + String(card.onSale)]}`}>
                                    {card.onSale ? 'В продаже' : 'Нет в продаже'}</div>
                                <div
                                    className={styles['card-choice-btn']}>
                                    {selectedId === card.id ? '> Редактирование ˂' : '» Редактировать «'}</div>
                            </div>))}
                        </div>
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
                    </div>
                    {selectedId !== -1 ? <>
                        <SeparatorLabel label={'Редактирование карты'}/>
                        <div>
                            {selectedId !== -1 ? <EditCard onReload={onReload} cardId={selectedId}/> : ''}
                        </div>
                    </> : ''}
                </div> :
                <div className={styles['card-choice-empty']}>
                    Нет загруженных карт
                </div>}</BlockLabel>);
    } else {
        return (<div className={styles['card-choice-block'] + ' plup-loader'}></div>)
    }

};

export default CardList;