import React, {useCallback} from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import {Link} from "react-router-dom";

const ProductItemBasket = ({setBasketF, product}) => {
    const item = product;
    const {user} = useTelegram();

    const sendData = {
        method: 'del',
        mainData: item.id,
        user: user,
    }

    const onSendData = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/basket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendData)
        }).then(r => {
            let Promise = r.json()
            Promise.then(r => {
                console.log(r.body)
                return setBasketF(r.body);
            })
        })
    }, [sendData])

    let platform = ''
    if (typeof item.body.platform !== 'undefined') {
        if (typeof item.body.view === 'undefined') {
            platform = item.body.platform
        } else {
            platform = item.body.view
        }
    } else {
        platform = ''
    }

    let price = ''
    if (item.body.isSale) {
        price = item.body.price + ' ₽'
    } else {
        price = 'Нет в продаже!'
    }

    let oldPrice = ''
    let parcent = ''
    if (typeof item.body.oldPrice === 'undefined') {
        if (typeof item.body.releaseDate === 'undefined') {
            parcent = ''
        } else {
            parcent = item.body.releaseDate.replace('#', '')
            parcent = parcent.slice(0, 6)+ parcent.slice(8, 10)
        }
    } else {
        oldPrice = String(item.body.oldPrice) + ' ₽'
        parcent = '−'+String(Math.ceil((1-item.body.price/item.body.oldPrice)*100))+'%'
    }

    let endDate = ''
    if (typeof item.body.endDate === 'undefined') {
        endDate = ''
    } else {
        endDate = 'Скидка ' + parcent + ' ' + item.body.endDate
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

    let type = 0
    if (typeof item.body.oldPrice === 'undefined') {
        if (typeof item.body.releaseDate === 'undefined') {
            parcent = ''
            type = 0
        } else {
            parcent = item.body.releaseDate.replace('#', '')
            parcent = parcent.slice(0, 6) + parcent.slice(8, 10)
            type = 2
        }
    } else {
        type = 1
    }
    let priceEl = (<div className={'text-element text-basket'} style={{
        lineHeight: '15px',
        marginTop: '0',
        height: '15px',
        fontSize: '15px',
    }}>{item.body.price+' ₽'}</div>)

    let oldPriceEl = (<div></div>)

    if (type === 1) {
        priceEl = (<div className={'text-element text-basket'} style={{
            lineHeight: '15px',
            marginTop: '0',
            height: '15px',
            fontSize: '15px',
            color: '#ff5d5d',
            marginRight:'0px'
        }}>{item.body.price+' ₽'}</div>)
        oldPriceEl = (<div className={'text-element text-basket'} style={{
            lineHeight: '15px',
            marginTop: '0',
            height: '15px',
            fontSize: '15px',
            color:'gray',
            textDecoration:'line-through'
        }}>{item.body.oldPrice+' ₽'}</div>)
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
            background: '#232323',
            borderRadius: '10px',
            margin: '10px 0 0 10px',
            width: String(window.innerWidth - 20) + 'px'
        }}>
            <Link to={'/card/' + item.id} className={'link-element'}
                  style={{display: 'flex', flexDirection: 'row', justifyContent: 'left'}}>
                <div className={'img'} style={{
                    height: '80px',
                    width: '80px',
                    borderRadius: '7px',
                    backgroundImage: "url('" + item.body.img + "')",
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
                    }}>{platform + ' • ' + item.body.title}</div>
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
                        color: '#696969',
                        overflow: 'hidden',
                        lineHeight: '15px',
                        height: '15px',
                        marginTop: '5px'
                    }}>
                        {endDate}
                    </div>
                </div>
            </Link>
            <div onClick={() => {
                sendData.mainData = item.id;
                sendData.method = 'del'
                onGetData()
            }} style={{justifyContent: 'center', alignContent: "center", marginRight: '20px'}}>
                <div className={'background-trash'}
                     style={{padding: '10px', height: '20px', width: '20px'}}>
                </div>
            </div>
        </div>
    );
};

export default ProductItemBasket;