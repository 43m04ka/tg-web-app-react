import React, {useState} from 'react';
import {useServer} from "../useServer";
import styles from "./EditCard.module.scss"
import InputLabel from "../Elements/InputLabel";
import ButtonLabel from "../Elements/ButtonLabel";
import useData from "../useData";
import SeparatorLabel from "../Elements/SeparatorLabel";

const EditCard = ({cardId, onReload}) => {

    const [cardData, setCardData] = useState(null);
    const [updateCardData, setUpdateCardData] = useState({});
    const {authenticationData} = useData()
    const {getCard, updateCardData: updateCard, deleteCard} = useServer();

    if (cardData === null || cardId !== cardData.id) {
        getCard(setCardData, cardId).then();
        onReload()
    }
    console.log(cardData);


    if (cardData !== null) {
        return (
            <div>
                <div className={styles['main']}>
                    <div className={styles['image']} style={{backgroundImage: 'url(' + cardData.image + ')'}}/>
                    <div className={styles['body']}>
                        <InputLabel label={'Имя'} placeholder={cardData.name} onChange={(e) => {
                            let newJson = updateCardData
                            newJson['name'] = e.target.value;
                            setUpdateCardData(newJson);
                        }}/>
                        <InputLabel label={'Цена'} placeholder={cardData.price} onChange={(e) => {
                            let newJson = updateCardData
                            newJson['price'] = e.target.value;
                            setUpdateCardData(newJson);
                        }}/>
                        <InputLabel label={'Старая цена'} placeholder={cardData.oldPrice} onChange={(e) => {
                            let newJson = updateCardData
                            newJson['oldPrice'] = e.target.value;
                            setUpdateCardData(newJson);
                        }}/>
                        <InputLabel label={'Цена в другой валюте'} placeholder={cardData.priceInOtherCurrency}
                                    onChange={(e) => {
                                        let newJson = updateCardData
                                        newJson['priceInOtherCurrency'] = e.target.value;
                                        setUpdateCardData(newJson);
                                    }}/>
                    </div>
                    <div className={styles['body']}>
                        <ButtonLabel label={'Выставить в продажу'}
                                     onClick={() => updateCard(() => setCardData(null), authenticationData, cardId, {onSale: true})}/>
                        <ButtonLabel label={'Убрать с продажи'}
                                     onClick={() => updateCard(() => setCardData(null), authenticationData, cardId, {onSale: false})}/>
                        <ButtonLabel label={'Сохранить'}
                                     onClick={() => updateCard(() => setCardData(null), authenticationData, cardId, updateCardData)}/>
                        <ButtonLabel label={'Удалить'} onClick={()=>deleteCard(onReload, authenticationData, cardId)}/>
                    </div>
                </div>
                {cardData.similarCard !== null ? <div>
                    <SeparatorLabel label={'Мин. цена с аналогичных карт: ' + cardData.similarCard.price}/></div> : <></>}

            </div>);
    } else {
        return (<div className={'plup-loader'}></div>)
    }
}
export default EditCard;


// let colorButtonStatus, textColorButtonStatus, textButtonStatus
//
// if (cardData.body.isSale) {
//     textButtonStatus = 'Убрать с продажи'
//     colorButtonStatus = 'white'
//     textColorButtonStatus = 'black'
// } else {
//     textButtonStatus = 'Включить в продажу'
//     colorButtonStatus = '#ef7474'
//     textColorButtonStatus = 'white'
// }
//
// let height = 0
// let textButton = 'Изменить цену'
// let buttonColor = 'black'
// let buttonBackground = 'white'
//
// height = cardData.category.length * 30 + 60
// textButton = 'Скрыть поле поле'
// buttonBackground = '#ef7474'
// buttonColor = 'white'
//
// let newPriceArr = cardData.price
//
// let oldPriceValue = null
//
// if (typeof cardData.body.endDate !== 'undefined') {
//     oldPriceValue = cardData.body.oldPrice
// }
//
// let oldPriceEditElement = (<div style={{height: '25px'}}>
//     <div style={{
//         display: 'flex', flexDirection: 'row', height: '25px', marginTop: '5px', width: 'max-content'
//     }}>
//         <div className={'text-element'} style={{
//             marginLeft: '0px', background: '#131313', lineHeight: '15px', padding: '5px', borderRadius: '100px',
//         }}>
//             <div style={{
//                 marginLeft: '5px', marginRight: '5px', height: '15px', overflow: 'hidden'
//             }}>
//                 {cardData.category.length + 1 + ' - Старая цена'}
//             </div>
//         </div>
//         <div className={'text-element'} style={{
//             marginLeft: '0px', background: '#131313', lineHeight: '15px', borderRadius: '100px',
//         }}>
//             <div style={{
//                 marginLeft: '5px', height: '25px', overflow: 'hidden', display: 'flex',
//             }}>
//                 <div style={{marginRight: '3px', marginTop: '5px',}}>
//                     Цена:
//                 </div>
//                 <input defaultValue={oldPriceValue}
//                        onChange={(event) => {
//                            oldPriceValue = parseInt(event.target.value)
//                        }} style={{
//                     borderRadius: '100px', border: '0px', paddingLeft: '5px'
//                 }}/>
//             </div>
//         </div>
//     </div>
// </div>)