import React from 'react';
import style from '../Product.module.scss'

const ProductBasketCounter = () => {

    const [counter, setCounter] = React.useState(1);

    return (<div className={style['productBasketCounter']}>
        <div onClick={()=>{setCounter(counter-1)}}>
            <p>-</p>
        </div>
        <p>{counter} шт.</p>
        <div onClick={()=>{setCounter(counter+1)}}>
            <p>+</p>
        </div>
    </div>);
};

export default ProductBasketCounter;