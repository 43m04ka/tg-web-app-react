import React, {useCallback, useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import ProductItem from "./ProductItem";
import ProductItemBasket from "./ProductItemBasket";

var isResizeble = true;

const Basket = () => {

    const [basket, setBasket] = useState([' '])

    const sendData = {
        method: 'get',
        user: {id: 5106439090, first_name: "tёma"},
    }

    const onGetData = useCallback(() => {
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
                if (isResizeble) {
                    isResizeble = false;
                    return setBasket(r.body);
                }
            })
        })
    }, [sendData])

    useEffect(() => {
        onGetData()
    }, []);

    if (isResizeble) {
        return (<div>Ожидайте</div>);
    } else {
        return (
            <div style={{display:'grid',gridTemplateRows:'50px 100% 100px' , height:'100%'}}>
                <div>

                </div>
                <div style={{height: "100%", border:'2px solid red'}}>
                    {basket.map(el => (
                        <ProductItemBasket key={el.id} setBasketF={setBasket}  product={el}/>
                    ))}
                </div>
                <div style={{marginBottom:'0px', position:'relative'}}>
                    <button className={'all-see-button'} style = {{marginBottom:'0px'}}>Оформить заказ</button>
                </div>
            </div>

        );
    }


};

export default Basket;