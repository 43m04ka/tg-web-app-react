import React from 'react';
import Button from "./Button";

const CardProduct = ({mainData, onAdd}) => {
    const itemData = mainData.mainData
    const onAddHandler = () => {
        onAdd(itemData);
    }
    console.log(itemData)
    return (
        <div>
            <span>{'Page '+itemData.title}</span>
            <Button className={'add-btn'} onClick={onAddHandler}>
                Добавить в корзину
            </Button>
        </div>
    );
};

export default CardProduct;