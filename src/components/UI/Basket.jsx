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
        user: {id: 5106439090},
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


    const styleYes = {background: rgb(colorYes), height:'37px'}
    const styleNo = {background: rgb(colorNo), height:'37px'}

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
                    height: String(height - 350 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
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
                <div style={{paddingLeft: '15px', borderTop: '2px solid gray'}}>
                    <div style={{width: String(window.innerWidth - 30) + 'px'}}>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: '5px',
                                height:'40px'
                            }}>
                                <div className={"text-element"}
                                     style={{fontSize: '15px', marginLeft: '0', marginRight: '0',}}>У
                                    меня есть свой аккаунт:
                                </div>
                                <div style={{
                                    width: '140px',
                                    justifyContent: 'space-between',
                                    display: 'flex',
                                    flexDirection: 'row',
                                }}>
                                    <div
                                        style={{width: '65px'}}>
                                        <button className={'selector-button'} onClick={onclickYes} style={styleYes}>Да
                                        </button>
                                    </div>
                                    <div
                                        style={{width: '65px'}}>
                                        <button className={'selector-button'} onClick={onclickNo} style={styleNo}>Нет
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: '5px',
                                height:'40px'
                            }}>
                                <div className={"text-element"}
                                     style={{fontSize: '15px', marginLeft: '0', marginRight: '0',}}>У
                                    меня есть промокод:
                                </div>
                                <div style={{
                                    width: '140px',
                                }}>
                                    <input style={{height:'37px', width:'140px', borderRadius:'10px', background:'#454545', border:'0px', fontSize:'15px', color:'white', fontFamily:"'Montserrat', sans-serif", paddingLeft:'5px'}} />
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: '5px',
                                height:'40px'
                            }}>
                                <div style={{marginTop: '10px', fontSize: '15px', marginLeft: '0', marginRight: '0'}}
                                     className={'text-element'}>Итого:
                                </div>
                                <div style={{marginTop: '10px', fontSize: '17px', marginLeft: '0', marginRight: '0'}}
                                     className={'text-element'}>{String(sumPrice)} ₽
                                </div>
                            </div>
                        </div>
                        <button className={'all-see-button'} style={{marginTop: '10px', width:String(window.innerWidth-30)+'px', background:'#52a557'}}
                                onClick={onClickButton}>Оформить
                            заказ
                        </button>
                    </div>
                </div>
            </div>

        );
    }


};

export default Basket;