import React, {useState} from 'react';
import BlockLabel from "../../Elements/BlockLabel";
import InputLabel from "../../Elements/InputLabel";
import ButtonLabel from "../../Elements/ButtonLabel";
import styles from "./EditCards.module.scss";
import SeparatorLabel from "../../Elements/SeparatorLabel";
import EditCard from "../../Blocks/EditCard";
import {useServer} from "../../useServer";

const EditCards = () => {

    const {searchForName} = useServer()

    const [cardList, setCardList] = useState(null)
    const [selectCardId, setSelectCardId] = useState(-1)
    const [searchInputValue, setSearchInputValue] = useState('')

    const onReload = async () => {await searchForName(setCardList, searchInputValue)}

    return (
        <div>
            <BlockLabel label={'Поиск карты'}>
                <InputLabel label={'Имя товара'} placeholder={'FC 25'} onChange={(e) => setSearchInputValue(e.currentTarget.value)} />
                <ButtonLabel label={'Поиск'} onClick={onReload}/>
            </BlockLabel>
            <BlockLabel label={'Результат'} onReload={onReload}>
                {cardList === null || cardList.length === 0 ? (<div className={styles['card-choice-empty']}>
                    Ничего не найдено
                </div>) : cardList.map(card => (<div
                    className={`${styles['card-choice-block']} ${selectCardId === card.id ? styles['card-choice-active'] : ''}`}
                    key={card.id} onClick={() => setSelectCardId(card.id)}>
                    <div className={styles['card-choice-label']}>
                        {card.name}</div>
                    <div
                        className={styles['card-choice-btn']}>
                        {selectCardId === card.id ? '> Выбран ˂' : '» Выбрать «'}</div>
                </div>))}
                {selectCardId !== -1 ? <>
                    <SeparatorLabel label={'Редактирование карты'}/>
                    <div>
                        {selectCardId !== -1 ? <EditCard onReload={onReload} cardId={selectCardId}/> : ''}
                    </div>
                </> : ''}
            </BlockLabel>

        </div>
    );
};

export default EditCards;