import React, {useState} from 'react';
import Button from "./Button";
import '../styles/style.css';
import {Link} from "react-router-dom";

const ProductItem = ({product, path}) => {

    return (
        <div className={'list-element'} style={{marginLeft:String((window.innerWidth-160-160)/3)+'px'}}>
            <Link to={'/home/' + path + '/' + product.id} className={'link-element'}>
                <div className={'box-home-block-element'}>
                    <img src={product.img} alt={product.title} className={'img-home'}/>
                    <div className={'text-element name-element'}>{product.title}</div>
                    <div className={'text-element price-element'}>{String(product.price) + ' ₽'}</div>
                </div>
            </Link>
        </div>
    )
        ;
};

export default ProductItem;