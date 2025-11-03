import React, {useCallback} from 'react';
import {useTelegram} from "../../../../../hooks/useTelegram";
import {Link} from "react-router-dom";
import {useServer} from "../useServer";
import useGlobalData from "../../../../../hooks/useGlobalData";

const ProductItemBasket = ({product, onReload, page}) => {
    const item = product;
    const {user} = useTelegram();
    const {deleteCardToBasket} = useServer()
    const {updatePreviewBasketData} = useGlobalData()

    let oldPrice = ''
    let parcent = ''
    let type = 0
    let price = item.price.toLocaleString() + ' ₽'


    if (item.oldPrice !== null) {
        type = 1
        oldPrice = item.oldPrice.toLocaleString() + ' ₽'
        parcent = 'Скидка −' + Math.ceil((1 - item.price / item.oldPrice) * 100) + '%' + ' ' + item.endDatePromotion
    } else if(item.similarCard !== null){
        type = 0
        price = item.similarCard?.price.toLocaleString() + ' ₽'
        if(typeof item.similarCard.oldPrice !== 'undefined' && typeof item.similarCard.oldPrice !== 'undefined') {
            type = 1
            parcent = 'Скидка −' + Math.ceil((1 - item.similarCard?.price / item.similarCard?.oldPrice) * 100) + '%' + ' ' + item.similarCard?.endDatePromotion
            oldPrice = item.similarCard?.oldPrice.toLocaleString() + ' ₽'
        }

    }

    if (item.releaseDate !== null) {
        let a = (new Date(item.releaseDate))*24*60*60*1000
        let currentDate = new Date('1899-12-30T00:00:00.000Z')
        let newDate = new Date(a + currentDate.getTime());

        parcent = newDate.toLocaleDateString('ru-RU')
        parcent = parcent.slice(0, 6) + parcent.slice(8, 10)

        type = 2
    }

    if(item.priceInOtherCurrency !== null && page === 3){
        price = item.priceInOtherCurrency.toLocaleString() + ' Rs'
        type = 0
        parcent = 'Цена в PS Store'
    }

    let parcentEl = (<div></div>)
    if(parcent !== ''){
        parcentEl = (<div style={{
            lineHeight: '20px',
            background: '#ff5d5d',
            paddingLeft: '3px',
            paddingRight: '3px',
            borderRadius: '5px',
            marginBottom: '5px',
            textDecoration: 'none',
            textAlign: 'left',
            marginRight: '5px',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            overflow: 'hidden',
            color: 'white',
            width: 'max-content',
            height:'20px'
        }}>{parcent}</div>)
    }

    let priceEl = (<div className={'text-element text-basket'} style={{
        lineHeight: '15px',
        marginTop: '0',
        height: '15px',
        fontSize: '15px',
    }}>{price}</div>)

    let oldPriceEl = (<div></div>)

    if (type === 1) {
        priceEl = (<div className={'text-element text-basket'} style={{
            lineHeight: '15px',
            marginTop: '0',
            height: '15px',
            fontSize: '15px',
            color: '#ff5d5d',
            marginRight:'0px'
        }}>{price}</div>)
        oldPriceEl = (<div className={'text-element text-basket'} style={{
            lineHeight: '15px',
            marginTop: '0',
            height: '15px',
            fontSize: '15px',
            color:'gray',
            textDecoration:'line-through'
        }}>{oldPrice}</div>)
    }
    if(type === 2){
        oldPriceEl = (<div className={'text-element text-basket'} style={{
            lineHeight: '15px',
            marginTop: '0',
            height: '15px',
            fontSize: '15px',
            color: '#4a9ed6',
        }}>Предзаказ</div>)
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: '5px',
            background: '#585858',
            borderRadius: '10px',
            margin: '1vw 2vw',
        }}>
            <Link to={'/card/' + item.id} className={'link-element'}
                  style={{display: 'flex', flexDirection: 'row', justifyContent: 'left'}}>
                <div className={'img'} style={{
                    height: '80px',
                    width: '80px',
                    borderRadius: '7px',
                    backgroundImage: "url('" + item.image + "')",
                    backgroundSize: 'cover',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'end',
                    justifyContent: 'space-between',
                }}></div>
                <div style={{
                    width: String(window.innerWidth - 140) + 'px',
                    display: 'grid',
                    gridTemplateRows: '30fr 15px 15fr',
                    height: '75px'
                }}>
                    <div className={'text-element text-basket'} style={{
                        marginTop: '5px',
                        lineHeight: '15px',
                        height: '30px',
                        fontSize: '13px',
                        overflow: 'hidden',
                        display: 'flex',
                    }}>{item.platform + ' • ' + item.name  + (item.choiceRow !== null ? ' • ' + item.choiceRow : '')}</div>
                    <div style={{
                        marginTop: '0px',
                        display: 'flex',
                        justifyContent: 'left',
                        alignItems: 'center',
                        height: '15px'
                    }}>
                        {priceEl}
                        {oldPriceEl}
                    </div>
                    <div className={'text-element'} style={{
                        fontSize: '13px',
                        color: '#ffffff',
                        overflow: 'hidden',
                        lineHeight: '15px',
                        height: '15px',
                        marginTop: '5px'
                    }}>
                        {parcent}
                    </div>
                </div>
            </Link>
            <div onClick={async () => {
                await deleteCardToBasket(async ()=>{onReload();updatePreviewBasketData(user.id)}, user.id, product.id).then()
            }} style={{justifyContent: 'center', alignContent: "center", marginRight: '20px'}}>
                <div className={'background-trash'}
                     style={{padding: '10px', height: '20px', width: '20px'}}>
                </div>
            </div>
        </div>
    );
};

export default ProductItemBasket;