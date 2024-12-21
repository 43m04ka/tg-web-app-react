import React, {useState} from 'react';
import '../styles/style.css';
import ProductItem from "./ProductItem";
import {useTelegram} from "../../hooks/useTelegram";
import {useCallback, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";


const getTotalPrice = (items = []) => {
    return items.reduce((acc, item) => {
        return acc += item.price
    }, 0)
}

const ProductList = ({main_data, page, height}) => {
    console.log(page)
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
        <div className={'list'} style={{display: 'flex', flexDirection: 'column'}}>
            <div className={'box-grid-panel'}>
                <Link to={'/home/search' + String(page)} className={'link-element'}>
                    <div className={'search'}></div>
                </Link>
                <Link to={'basket'} className={'link-element'}>
                    <div className={'div-button-panel'} style={{padding: '10px !important'}}>
                        <div className={'background-basket'} style={{width: '100%', height: '100%'}}></div>
                    </div>
                </Link>
                <div className={'div-button-panel'} style={{padding: '10px !important'}}>
                    <div className={'background-profile'} style={{width: '100%', height: '100%'}}></div>
                </div>
            </div>
            <div className={'list-grid'}>
                {products.map(item => (
                    <ProductItem key={item.id} product={item} path={path}/>
                ))}
            </div>
        </div>
    );
};

export default ProductList;