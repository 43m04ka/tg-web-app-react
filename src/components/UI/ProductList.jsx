import React, {useState} from 'react';
import '../styles/style.css';
import ProductItem from "./ProductItem";
import {useTelegram} from "../../hooks/useTelegram";
import {useCallback, useEffect} from "react";



const getTotalPrice = (items = []) => {
    return items.reduce((acc, item) => {
        return acc += item.price
    }, 0)
}

const ProductList = (data_list) => {
    const products = data_list.main_data
    const [addedItems, setAddedItems] = useState([]);
    const {tg, queryId} = useTelegram();
    console.log(products);

    const data = {
        products: addedItems,
        totalPrice: getTotalPrice(addedItems),
        queryId,
    }

    const onSendData = useCallback(() => {
        tg.sendData(JSON.stringify(data));
    }, [data])

    useEffect(() => {
        tg.onEvent('mainButtonClicked', onSendData)
        return () => {
            tg.offEvent('mainButtonClicked', onSendData)
        }
    }, [onSendData])

    const onAdd = (product) => {
        const alreadyAdded = addedItems.find(item => item.id === product.id);
        let newItems = [];

        if (alreadyAdded) {
            newItems = addedItems.filter(item => item.id !== product.id);
        } else {
            newItems = [...addedItems, product];
        }

        setAddedItems(newItems)

        if (newItems.length === 0) {
            tg.MainButton.hide();
        } else {
            tg.MainButton.show();
            tg.MainButton.setParams({
                text: `Купить ${getTotalPrice(newItems)}`
            })
        }
    }

    return (
        <div className={'list'}>
            {products.map(item => (
                <ProductItem key = {item.id} product={item} onAdd={onAdd} className={'item'}/>
            ))}
        </div>
    );
};

export default ProductList;