import React from 'react';
import {Link} from "react-router-dom";

const SearchPosition = ({data : item}) => {

    let platform = ''
    if (typeof item.platform !== 'undefined') {
        if (typeof item.view === 'undefined') {
            platform = item.platform
        } else {
            platform = item.view
        }
    } else {
        platform = ''
    }

    let oldPrice = ''
    let parcent = ''
    let price = item.price.toLocaleString() + ' ₽'
    let type = 0

    if (item.oldPrice !== null) {
        type = 1
        oldPrice = item.oldPrice.toLocaleString() + ' ₽'
        parcent = '−' + Math.ceil((1 - item.price / item.oldPrice) * 100) + '%'
    } else if (item.similarCard !== null) {
        type = 1
        price = item.similarCard?.price.toLocaleString() + ' ₽'
        if (typeof item.similarCard.oldPrice !== 'undefined') {
            parcent = '−' + Math.ceil((1 - item.similarCard?.price / item.similarCard?.oldPrice) * 100) + '%'
            oldPrice = item.similarCard?.oldPrice.toLocaleString() + ' ₽'
        }
        if (typeof item.similarCard.endDatePromotion !== 'undefined') {
        }
    }

    if (item.releaseDate !== null) {
        let a = (new Date(item.releaseDate)) * 24 * 60 * 60 * 1000
        let currentDate = new Date('1899-12-30T00:00:00.000Z')
        let newDate = new Date(a + currentDate.getTime());

        if (newDate < ((new Date()))) {
            parcent = "Уже в продаже"
        } else {
            parcent = newDate.toLocaleDateString('ru-RU')
            parcent = 'Предзаказ ' + parcent.slice(0, 6) + parcent.slice(8, 10)
        }

        type = 2
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
        }}>{price}</div>)
        oldPriceEl = (<div className={'text-element text-basket'} style={{
            lineHeight: '15px',
            marginTop: '0',
            height: '15px',
            fontSize: '15px',
            color: 'gray',
            textDecoration: 'line-through'
        }}>{oldPrice}</div>)
    }
    if (type === 2) {
        oldPriceEl = (<div className={'text-element text-basket'} style={{
            lineHeight: '15px',
            marginTop: '0',
            height: '15px',
            fontSize: '15px',
            color: '#4a9ed6',
        }}>{parcent}</div>)
    }

    return (
        <div className={'list-element'}
             style={{marginLeft: '5%', width: String(window.innerWidth - 40) + 'px', marginTop:'0', marginBottom: '3%'}}>
            <Link to={'/card/' + item.id} className={'link-element'}
                  style={{display: 'flex', flexDirection: 'row', justifyContent: 'left'}}>
                <div style={{
                    height: '75px',
                    width: '75px',
                }}>
                    <div style={{
                        backgroundImage: 'url("' + item.image + '+")',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'end',
                        height: '75px',
                        width: '75px',
                        paddingLeft: '5px',
                        borderRadius: '7px'
                    }}>
                    </div>
                </div>
                <div className={'box-grid-row'}>
                    <div className={'text-element text-basket'} style={{
                        marginTop: '3px',
                        lineHeight: '15px',
                        height: '30px',
                        fontSize: '13px',
                        overflow: 'hidden'
                    }}>{item.name}</div>
                    <div className={'text-element text-basket'} style={{
                        marginTop: '3px',
                        lineHeight: '14px',
                        height: '14px',
                        fontSize: '9px',
                        overflow: 'hidden',
                        marginBottom: '0px'
                    }}>{platform}</div>
                    <div
                        style={{display: 'flex', justifyContent: 'left', alignItems: 'center', height: '15px'}}>
                        {priceEl}
                        {oldPriceEl}
                    </div>
                </div>
            </Link>
        </div>)

};

export default SearchPosition;