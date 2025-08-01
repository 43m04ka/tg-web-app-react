import React, {useState} from 'react';
import '../styles/style.css';
import {Link} from "react-router-dom";

const ProductItem = ({product}) => {

    let oldPrice = ''
    let parcent = ''
    if (typeof product.oldPrice === null) {
        if (typeof product.releaseDate === null) {
            parcent = ''
        } else {
            parcent = product.releaseDate.replace('#', '')
            parcent = parcent.slice(0, 6) + parcent.slice(8, 10)
        }
    } else if (product.oldPrice > product.price) {
        oldPrice = product.oldPrice.toLocaleString() + ' ₽'
        parcent = '−' + String(Math.ceil((1 - product.price / product.oldPrice) * 100)) + '%'
    }
    let parcentEl = (<div></div>)
    if (parcent !== '') {
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
            width: 'max-content'
        }}>{parcent}</div>)
    }

    let view = product.choiceRow === null ? '' : ' ' + product.choiceRow

    let platform = (<div></div>)
    if (typeof product.platform !== null && product.platform !== null) {
        platform = (<div style={{
            lineHeight: '20px',
            background: '#191919',
            paddingLeft: '3px',
            paddingRight: '3px',
            borderRadius: '5px',
            marginBottom: '5px',
            textDecoration: 'none',
            textAlign: 'left',
            marginLeft: '5px',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            overflow: 'hidden',
            color: 'white',
            width: 'max-content'
        }}>{product.platform}</div>)
    }

    let price = ''
    try{
        price = product.price.toLocaleString() + ' ₽'
    }catch (e) {
        
    }


    return (
        <div className={'list-element'}>
            <Link to={'/card/' + product.id} className={'link-element'}>
                <div className={'box-home-block-element'}>
                    <div style={{
                        backgroundImage: 'url("' + product.image + '")',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'end',
                        justifyContent: 'space-between',
                    }} className={'img-home'}>
                        {platform}
                        {parcentEl}
                    </div>
                    <div style={{height: '39px', overflow: 'hidden', lineHeight: '20px'}}>
                        <div className={'text-element name-element'}>{product.name + view}</div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'left'}}>
                        <div className={'text-element price-element'}>{price}</div>
                        <div className={'text-element price-element'}
                             style={{textDecoration: 'line-through', color: 'gray'}}>{oldPrice}</div>
                    </div>
                </div>
            </Link>
        </div>
    )
        ;
};

export default ProductItem;