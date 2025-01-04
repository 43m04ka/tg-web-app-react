import React, {useCallback, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import ProductItem from "./ProductItem";
import ProductItemBasket from "./ProductItemBasket";
import {useTelegram} from "../../hooks/useTelegram";

const Basket = ({height}) => {
    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    console.log(user)

    const [basket, setBasket] = useState([])
    const [myAcc, setMyAcc] = useState(0);
    const [colorYes, setColorYes] = useState([81, 164, 86]);
    const [colorNo, setColorNo] = useState([45, 12, 12]);
    const [status, setStatus] = useState(0);

    const sendDataProduct = {
        method: 'buy',
        user: user,
    }

    function rgb([r, g, b]) {
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).substring(1);
    }

    const onClickButton = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/basket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendDataProduct)
        }).then(r => {
            console.log(r)
        })
    }, [sendDataProduct])

    const sendData = {
        method: 'get',
        user: user,
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
                setBasket(r.body);
                setStatus(1);
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
        return sumPrice += el.price
    })

    const onclickYes = () => {
        setMyAcc(0);
        setColorYes([81, 164, 86]);
        setColorNo([45, 12, 12]);
    }
    const onclickNo = () => {
        setMyAcc(1);
        setColorNo([164, 30, 30]);
        setColorYes([12, 45, 12]);
    }


    const styleYes = {background: rgb(colorYes)}
    const styleNo = {background: rgb(colorNo)}

    if (status === 0) {
        onGetData()
        return (<div className={'pong-loader'} style={{
            border: '2px solid #8cdb8b',
            marginTop: String(height / 2 - 60) + 'px',
            marginLeft: String(window.innerWidth / 2 - 40) + 'px'
        }}>Ожидайте</div>);
    } else if (basket.length === 0) {
        return (
            <div style={{display: 'grid'}}>
                <div style={{
                    height: String(height - 100 - 15 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
                    marginTop: '15px', marginLeft: String(window.innerWidth / 2 - 45) + 'px',
                    color: 'gray'
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
                        <button className={'all-see-button'} style={{marginTop: '10px'}}>На главную
                        </button>
                    </Link>
                </div>
            </div>)
    } else {
        let count = 1;
        basket.map(el => {
            el.number = count;
            count += 1
        })
        return (
            <div style={{display: 'grid'}}>
                <div style={{
                    height: String(height - 15 - 100 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
                    overflowY: 'scroll'
                }}>
                    <div className={'title'} style={{
                        marginLeft: String(window.innerWidth / 2 - 75) + 'px',
                        marginRight: 'auto',
                        marginTop: '10px'
                    }}>Ваша корзина
                    </div>
                    {basket.map(el => (
                        <ProductItemBasket key={el.id} setBasketF={setBasket} product={el}/>
                    ))}
                </div>
                <div style={{marginBottom: '0px', position: 'relative'}}>
                    <div style={{
                        borderTop: '2px solid gray'
                    }}>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                width: String(window.innerWidth - 15-35) + 'px',
                                justifyContent: 'space-between',
                                alignItems:'center',
                                marginLeft:'15px'
                            }}>
                                <div className={"text-element"} style={{fontSize:'20px'}}>У меня есть свой аккаунт:</div>
                                <div className="selector-container" style={{
                                    height: '60px',
                                    width: '135px',
                                    transitionProperty: 'height',
                                    transitionDuration: '0.1s'
                                }}>
                                    <div className={'div-box-4563'}
                                         style={{width: '75px', height: "100%", padding: '3px'}}>
                                        <button className={'selector-button'} onClick={onclickYes} style={styleYes}>Да
                                        </button>
                                    </div>
                                    <div className={'div-box-4563'}
                                         style={{width: '75px', height: "100%", padding: '3px'}}>
                                        <button className={'selector-button'} onClick={onclickNo} style={styleNo}>Нет
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                width: String(window.innerWidth - 15) + 'px',
                                justifyContent: 'space-between',
                            }}>
                                <div style={{marginTop: '10px', fontSize: '20px', marginLeft: '20px'}}
                                     className={'text-element'}>Итого:
                                </div>
                                <div style={{marginTop: '10px', fontSize: '20px', marginRight: '20px'}}
                                     className={'text-element'}>{String(sumPrice)} ₽
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className={'all-see-button'} style={{marginTop: '10px'}}
                            onClick={onClickButton}>Оформить
                        заказ
                    </button>
                </div>
            </div>

        );
    }


};

export default Basket;