import React from 'react';
import Button from "./Button";
import '../styles/style.css';
import {Link} from "react-router-dom";

const ProductItem = ({product, className, onAdd}) => {
    const onAddHandler = () => {
        onAdd(product);
    }

    return (
        <div className={'product ' + className}>
            <Link to={String(product.id)}>
                <img src={product.img} className={'img'} alt="Product Image"/>
                <div className={'title'}>{product.title}</div>
                <div className={'description'}>{product.description}</div>
                <div className={'price'}>
                    <span>Стоимость: <b>{product.price}</b></span>
                </div>
            </Link>
            <Button className={'add-btn'} onClick={onAddHandler}>
                Добавить в корзину
            </Button>

        </div>
    );
};

export default ProductItem;