import React, {useCallback, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import ProductItem from "./ProductItem";
import ProductItemBasket from "./ProductItemBasket";
import {useTelegram} from "../../hooks/useTelegram";

var isResizeble = true;

const Basket = ({height}) => {
    const {tg, user} = useTelegram();
    const navigate = useNavigate();

    const [basket, setBasket] = useState([])

    const sendDataProduct = {
        method: 'buy',
        user: {id: 5106439090, first_name: "tёma"},
    }

    const onClickButton = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/basket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendDataProduct)
        }).then(r => {console.log(r)})
    }, [sendDataProduct])

    useEffect(() => {
        onGetData()
    }, []);

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

    let sumPrice = 0

    basket.map(el => {
        return  sumPrice += el.price
    })

    if (isResizeble) {
        return (<div className={'pong-loader'} style={{
            border: '2px solid #8cdb8b',
            marginTop: String(height / 2 - 60) + 'px',
            marginLeft: String(height / 2 - 40) + 'px'
        }}>Ожидайте</div>);
    } else if (basket.length === 0) {
        return (
            <div style={{display: 'grid', height: String(height - 100)+'px'}}>
                <div style={{
                    height: String(height - 15 - 100 - 70) + 'px',
                    marginTop: '15px', marginLeft : String(height/2-45)+'px',
                    color:'gray'
                }} className={'text-element'}>
                    Корзина пуста
                </div>
                <div style={{marginBottom: '0px', position: 'relative'}}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        justifyContent: 'space-between',
                        borderTop: '2px solid gray'
                    }}>
                        <div style={{marginTop: '10px', fontSize: '20px', marginLeft: '20px'}}
                             className={'text-element'}>Итого:
                        </div>
                        <div style={{marginTop: '10px', fontSize: '20px', marginRight: '20px'}}
                             className={'text-element'}>0 ₽
                        </div>
                    </div>
                    <Link to={'/home'} className={'link-element'}>
                        <button className={'all-see-button'} style={{marginTop: '10px'}}>На главную</button>
                    </Link>
                </div>
            </div>)
    } else {
        return (
            <div style={{display: 'grid'}}>
                <div style={{
                    height: String(height - 15 - 100) + 'px',
                    marginTop: '15px', overflowY:'scroll'
                }}>
                    {basket.map(el => (
                        <ProductItemBasket key={el.id} setBasketF={setBasket} product={el}/>
                    ))}
                </div>
                <div style={{marginBottom: '0px', position: 'relative'}}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        justifyContent: 'space-between',
                        borderTop: '2px solid gray'
                    }}>
                        <div style={{marginTop: '10px', fontSize: '20px', marginLeft: '20px'}}
                             className={'text-element'}>Итого:
                        </div>
                        <div style={{marginTop: '10px', fontSize: '20px', marginRight: '20px'}}
                             className={'text-element'}>{String(sumPrice)} ₽
                        </div>
                    </div>
                    <button className={'all-see-button'} style={{marginTop: '10px'}} onClick={onClickButton}>Оформить заказ</button>
                </div>
            </div>

        );
    }


};

export default Basket;