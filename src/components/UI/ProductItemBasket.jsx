import React, {useCallback} from 'react';
import {useTelegram} from "../../hooks/useTelegram";

const ProductItemBasket = ({setBasketF, product}) => {
    const item = product;
    const {user} = useTelegram();

    const sendData = {
        method: 'del',
        mainData: item,
        user: user,
    }

    const onSendData = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/basket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendData)
        }).then(r => {
            let Promise = r.json()
            Promise.then(r => {
                console.log(r.body)
                return setBasketF(r.body);
            })
        })
    }, [sendData])

    return (
        <div className={'box-item-basket'}>
            <img src={item.img} alt={item.title} className={'img'}/>
            <div className={'box-grid-row'}>
                <div className={'text-element text-basket'}>{item.price + ' ₽'}</div>
                <div className={'text-element text-basket'}>{item.title}</div>
                <div className={'text-element text-basket'}>{item.description}</div>
            </div>
            <div onClick={onSendData} className={'button-trash'}>
                <div className={'background-trash'}>
                </div>
            </div>
        </div>
    );
};

export default ProductItemBasket;