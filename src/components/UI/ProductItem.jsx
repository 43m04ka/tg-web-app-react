import React, {useState} from 'react';
import '../styles/style.css';
import {Link} from "react-router-dom";

const ProductItem = ({product, path}) => {

    let oldPrice = ''
    if (typeof product.old_price === 'undefined') {
        oldPrice = ''
    } else {
        oldPrice = String(product.old_price) + ' ₽'
    }

    let dataRelease = ''
    if (typeof product.release === 'undefined') {
        dataRelease = ''
    } else {
        const val = product.release * 1000000;
        const msecsPerDay = 24 * 60 * 60 * 1000;
        const ms = Math.round(val / 1E+6 * msecsPerDay);
        const start = new Date(1900, 0, 1);
        const date = new Date(ms + start.valueOf());
        console.log(date.toString());
    }

    return (
        <div className={'list-element'} style={{marginLeft: String((window.innerWidth - 160 - 160) / 3) + 'px'}}>
            <Link to={'/home/' + product.id} className={'link-element'}>
                <div className={'box-home-block-element'}>
                    <div style={{
                        backgroundImage: 'url("' + product.img + '+")',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        paddingTop: '135px',
                        justifyItems: 'left'
                    }} className={'img-home'}>
                        <div className={'text-element'} style={{lineHeight: '20px'}}>{product.platform}</div>
                    </div>
                    <div style={{height:'40px', overflow:'hidden'}}>
                    <div className={'text-element name-element'}>{product.title}</div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'left'}}>
                        <div className={'text-element price-element'}>{String(product.price) + ' ₽'}</div>
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