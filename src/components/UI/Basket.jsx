import React, {useCallback, useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import ProductItem from "./ProductItem";
import ProductItemBasket from "./ProductItemBasket";
import {useTelegram} from "../../hooks/useTelegram";

var isResizeble = true;

const Basket = () => {
    const {tg} = useTelegram();

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
                } else {
                    isResizeble = true;
                }
            })
        })
    }, [sendData])

    useEffect(() => {
        onGetData()
    }, []);

    const onBack = useCallback(async () => {
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


    if (isResizeble) {
        return (<div className={'pong-loader'} style={{border:'2px solid #8cdb8b', marginTop:String(window.innerHeight/2-25)+'px', marginLeft:String(window.innerWidth/2-40)+'px'}}>Ожидайте</div>);
    } else if (basket.length === 0) {
        return (<div>Корзина пуста</div>)
    } else {
        return (
            <div style={{display: 'grid', height: '100%'}}>
                <div style={{
                    height: String(window.innerHeight - 15 - 100) + 'px',
                    marginTop: '15px'
                }}>
                    {basket.map(el => (
                        <ProductItemBasket key={el.id} setBasketF={setBasket} product={el}/>
                    ))}
                </div>
                <div style={{marginBottom: '0px', position: 'relative'}}>
                    <div style={{display: 'flex', alignItems:'center', width:'100%', justifyContent:'space-between', borderTop:'2px solid gray'}}>
                        <div style={{marginTop: '10px', fontSize: '20px', marginLeft:'20px'}} className={'text-element'}>Итого:</div>
                        <div style={{marginTop: '10px', fontSize: '20px', marginRight:'20px'}} className={'text-element'}>{String(123)} ₽</div>
                    </div>
                    <button className={'all-see-button'} style={{marginTop: '10px'}}>Оформить заказ</button>
                </div>
            </div>

        );
    }


};

export default Basket;