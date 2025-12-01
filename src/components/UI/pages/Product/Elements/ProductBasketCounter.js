import React from 'react';
import style from '../Product.module.scss'

const ProductBasketCounter = () => {
    return (<div className={style['productBasketCounter']}>
        <div>
            <p>-</p>
        </div>
        <p>1 шт.</p>
        <div>
            <p>+</p>
        </div>
    </div>);
};

export default ProductBasketCounter;