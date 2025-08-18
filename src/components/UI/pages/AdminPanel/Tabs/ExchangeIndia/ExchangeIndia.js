import React, {useState} from 'react';
import BlockLabel from "../../Elements/BlockLabel";
import {useServer} from "./useServer";
import styles from "./ExchangeIndia.module.scss";
import CreateCard from "./CreateCard";
import SwitchLabel from "../../Elements/SwitchLabel";
import SeparatorLabel from "../../Elements/SeparatorLabel";
import ButtonLabel from "../../Elements/ButtonLabel";
import useData from "../../useData";

const ExchangeIndia = () => {

    const [cardList, setCardList] = useState(null);
    const [selectedCardId, setSelectedCardId] = useState(-1);
    const {getExchangeIndiaCardList, deleteExchangeIndiaCard} = useServer()
    const {authenticationData} = useData()


    if(cardList === null){
        getExchangeIndiaCardList(setCardList).then()
    }else {
        return (
            <div>
                <BlockLabel label={'Список карт обмена'} onReload={()=>{getExchangeIndiaCardList(setCardList).then()}}>
                    {cardList.length === 0 ? (<div className={styles['card-choice-empty']}>
                        Нет загруженных карт обмена
                    </div>) : cardList.map(card => (<div
                        className={`${styles['card-choice-block']} ${selectedCardId === card.id ? styles['card-choice-active'] : ''}`}
                        key={card.name} onClick={() => setSelectedCardId(card.id)}>
                        <div className={styles['card-choice-label']}>
                            {card.name}</div>
                        <div className={styles['card-choice-label']}>
                            {card.price + 'р.'}</div>
                        <div
                            className={styles['card-choice-btn']}>
                            {selectedCardId === card.id ? '> Выбран ˂' : '» Выбрать «'}</div>
                    </div>))}
                </BlockLabel>

                <CreateCard onReload = {()=>{getExchangeIndiaCardList(setCardList).then()}}/>

                {selectedCardId !== -1 ? (<BlockLabel label={'Действие'}>
                    <ButtonLabel label={'Удалить'} onClick={()=>{
                        deleteExchangeIndiaCard(() => getExchangeIndiaCardList(setCardList).then(), authenticationData, selectedCardId).then()
                        setSelectedCardId(-1)
                    }}/>
                </BlockLabel>) : ''}
            </div>
        );
    }
};

export default ExchangeIndia;