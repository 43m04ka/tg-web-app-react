import React, {useState} from 'react';
import '../styles/style.css';
import ProductItem from "./ProductItem";
import {useTelegram} from "../../hooks/useTelegram";
import {useCallback, useEffect} from "react";
import {useNavigate} from "react-router-dom";


const getTotalPrice = (items = []) => {
    return items.reduce((acc, item) => {
        return acc += item.price
    }, 0)
}

const ProductList = ({main_data}) => {
    const products = main_data.body
    const path = main_data.path
    const [addedItems, setAddedItems] = useState([]);
    const {tg, queryId, user} = useTelegram();
    const navigate = useNavigate();

    const onBack = useCallback(() => {
        navigate(-1);
    }, [])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])

    useEffect(() => {
        tg.BackButton.show();
    }, [])

    return (
        <div className={'list'}>
            <div className={'list-grid'}>
                {products.map(item => (
                    <ProductItem key={item.id} product={item} path = {path}/>
                ))}
            </div>
        </div>
    );
};

export default ProductList;