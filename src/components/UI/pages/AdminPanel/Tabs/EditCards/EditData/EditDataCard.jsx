import React, {useEffect, useState} from 'react';
import {useServer} from "../../../useServer";
import style from "./EditDataCard.module.scss"
import useData from "../../../useData";
import PopUpWindow from "../../../Elements/PopUpWindow/PopUpWindow";
import EditDataPosition from "../../../Blocks/EditDataPosition/EditDataPosition";

const structure = [
    {type: 'string', key: 'name', label: 'Имя'},
    {type: 'string', key: 'platform', label: 'Платформа'},
    {type: 'string', key: 'description', label: 'Описание'},
    {type: 'number', key: 'price', label: 'Цена'},
    {type: 'number', key: 'oldPrice', label: 'Старая цена'},
    {type: 'number', key: 'priceInOtherCurrency', label: 'Цена в другой валюте'},
    {type: 'string', key: 'image', label: 'Ссылка на изображение'},
    {type: 'string', key: 'linkToOriginal', label: 'Ссылка на оригинал карты'},
    {type: 'string', key: 'regionActivate', label: 'Регион активации'},
    {type: 'string', key: 'endDatePromotion', label: 'Конец акции'},
    {type: 'string', key: 'genre', label: 'Жанр'},
    {type: 'string', key: 'numberPlayers', label: 'Количество игроков'},
    {type: 'string', key: 'language', label: 'Язык'},
    {type: 'string', key: 'voice', label: 'Язык озвучки'},
    {type: 'string', key: 'type', label: 'Тип (game, other)'},
    {type: 'boolean', defaultValue: true, key: 'onSale', label: 'Включено в продажу'},
    {type: 'string', key: 'choiceRow', label: 'Вид'},
    {type: 'string', key: 'choiceColumn', label: 'Подвид'},
    {type: 'string', key: 'additionalParameter', label: 'Доп. параметр для баннера подписки'},
    {type: 'number', key: 'catalogId', label: 'id каталога'},
    {
        type: 'list',
        key: 'descriptionImages',
        label: 'Дополнительные изображения',
        body: {type: 'string', label: 'Ссылка на изображение:'}
    },
]

const EditDataCard = ({cardId, onReload, onClose}) => {

    const [cardData, setCardData] = useState({});
    const [updateCardData, setUpdateCardData] = useState({});
    const {authenticationData} = useData()
    const {getCard, updateCardData: updateCard, deleteCard} = useServer();


    useEffect(() => {
        getCard(setCardData, cardId).then();
    }, [cardId]);


    return (
        <PopUpWindow title={cardData.name || 'Загрузка'}>
            {typeof cardData.name !== 'undefined' ?
                <div>
                    <EditDataPosition structure={structure} currentData={cardData} setNewData={setUpdateCardData}/>
                    {cardData.similarCard !== null ? <div>
                        <div
                            className={style['infoLabel']}>{'Мин. цена с аналогичных карт: ' + cardData.similarCard.price}</div>
                    </div> : <></>}

                </div>
                : ''}
            <div className={style['buttonPlace']}>
                <div className={style['buttonAccept']}
                     onClick={() => updateCard(() => {
                         onReload()
                         onClose()
                     }, authenticationData, cardId, updateCardData)}>
                    <div/>
                    <p>Сохранить</p>
                </div>

                <div className={style['buttonCancel']}
                     onClick={() => onClose()}>
                    <div/>
                    <p>Отмена</p>
                </div>
            </div>
        </PopUpWindow>);

}
export default EditDataCard;