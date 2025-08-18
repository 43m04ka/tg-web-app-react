import React from 'react';
import useGlobalData from "../../../../hooks/useGlobalData";
import {useServerUser} from "../../../../hooks/useServerUser";
import ProductItemBasket from "./ProductItemBasket";
import IndiaCountElement from "./IndiaCountElement";

const IndiaCount = ({basketList, setSum}) => {

    const {catalogList} = useGlobalData()
    const [cardList, setCardList] = React.useState([])
    const {getCardList} = useServerUser()

    let otherCurrencyPrice = 0
    basketList.map((item, index) => {
        otherCurrencyPrice += item.priceInOtherCurrency
    })

    let exchangeCatalogId = catalogList.map(item => {
        return item.isExchangeIndiaCatalog ? item.id : null
    }).filter(item => item !== null)

    let localPrice = otherCurrencyPrice
    let localList = []
    let sumPrice = 0

    cardList.map(item => {
        let itemPrice = item.priceInOtherCurrency
        let kol = Math.floor(localPrice / itemPrice)

        if (itemPrice - (localPrice - kol * itemPrice) < cardList[cardList.length - 1].priceInOtherCurrency) {
            item.kol = (kol + 1)
            localList.push(item)
            localPrice -= (kol + 1) * itemPrice
            sumPrice += item.price * (kol + 1)
        } else {
            item.kol = kol
            localList.push(item)
            localPrice -= kol * itemPrice
            sumPrice += item.price * kol
        }
    })

    setSum(sumPrice)

    if (localList.length === 0) {
        getCardList((result) => setCardList(result.cardList.sort(((a, b) => {
            return b.price - a.price
        }))), exchangeCatalogId, 1).then()
        return (<div className={'plup-loader'} style={{
                marginTop: '10px',
                marginLeft: String(window.innerWidth / 2 - 50) + 'px'
            }}></div>
        )
    } else {
        return (
            <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div className={'title'} style={{textAlign: 'left', marginLeft: '15px', fontSize: '17px', color:'#a368ff', marginBottom:'5px'}}>Карты для
                        пополнения
                    </div>
                    <div className={'title'} style={{textAlign: 'left', marginRight: '15px', fontSize: '17px', color:'#a368ff', marginBottom:'5px'}}>{otherCurrencyPrice-localPrice + ' Rs'}
                    </div>
                </div>
                {localList.map((item, index) => {
                    if (item.kol > 0) {
                        console.log(localList)
                        return <IndiaCountElement product={item} key={index}/>
                    }
                })}
                <div className={'text-element'} style={{
                    fontSize: '13px',
                    textAlign: 'center',
                    color: 'white',
                    overflow: 'hidden',
                    lineHeight: '15px',
                    margin:'5px 10px'
                }}>
                    {'Выбранные товары обойдутся в ' +otherCurrencyPrice + ' Rs. Баланс аккаунта будет пополнен на '+(otherCurrencyPrice-localPrice) + ' Rs. Непотраченные '+(otherCurrencyPrice-localPrice- otherCurrencyPrice)+' Rs останутся на вашем аккаунте для будущих покупок.'}
                </div>
            </div>
        );
    }
};

export default IndiaCount;