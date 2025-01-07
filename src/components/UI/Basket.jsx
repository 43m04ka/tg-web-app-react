import React, {useCallback, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import ProductItem from "./ProductItem";
import ProductItemBasket from "./ProductItemBasket";
import {useTelegram} from "../../hooks/useTelegram";

const Basket = ({height, number}) => {
    const {tg, user} = useTelegram();
    const navigate = useNavigate();

    const [basket, setBasket] = useState([])
    const [myAcc, setMyAcc] = useState(0);
    const [colorYes, setColorYes] = useState([81, 164, 86]);
    const [colorNo, setColorNo] = useState([45, 12, 12]);
    const [status, setStatus] = useState(0);
    const [buttonText, setButtonText] = React.useState('Оформить закказ и оплатить');

    const sendDataProduct = {
        method: 'buy',
        user: user,
    }

    function rgb([r, g, b]) {
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).substring(1);
    }

    const onClickButton = useCallback(() => {
        setButtonText('Оформляем заказ...')
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/basket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendDataProduct)
        }).then(r => {
            let Promise = r.json()
            Promise.then(r => {
                if (r.body) {
                    setStatus(3);
                } else {
                    setStatus(0)
                    setButtonText('Оформить заказ и оплатить')
                }
            })
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
                let newArray = []
                r.body.map(el => {
                    console.log(el.tab, number)
                    if (Number(el.tab) === number) {
                        newArray = [...newArray, el]
                    }
                })
                setBasket(newArray);
                setStatus(1)
            })
        })
    }, [sendData])

    const onBack = useCallback(async () => {
        if(status===1){
        navigate(-1);}
        else{setStatus(1)}
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


    const styleYes = {background: rgb(colorYes), height: '37px'}
    const styleNo = {background: rgb(colorNo), height: '37px'}

    let menuDesigns = null
    if (number === 0 && myAcc === 1) {
        menuDesigns = (<div className={'text-element'}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                textAlign: 'center',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: '5px',
                                overflow: 'hidden',
                                height: '40px'
                            }}>Мы оформим заказ на новый аккаунт PSN и передадим Вам его в полном доступе. Это
            бесплатно.< /div>)
    } else if (number === 0 && myAcc === 0) {
        menuDesigns = (<div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '5px',
            overflow: 'hidden',
        }}>
            <div className={'text-element'} style={{fontSize: '14px'}}>Введите логин и пароль от аккаунта PSN:</div>
            <input placeholder={"Введите логин от аккаунта PSN (name@gwstore.ru)"}
                   style={{
                       height: '40px',
                       width: String(window.innerWidth - 20) + 'px',
                       marginTop: '10px',
                       borderRadius: '10px',
                       background: '#454545',
                       textAlign: 'center',
                       border: '0px',
                       fontSize: '12px',
                       color: 'white',
                       fontFamily: "'Montserrat', sans-serif",
                   }}/>
            <input placeholder={"Введите пароль от аккаунта PSN"}
                   style={{
                       height: '40px',
                       width: String(window.innerWidth - 20) + 'px',
                       marginTop: '7px',
                       marginBottom: '10px',
                       borderRadius: '10px',
                       background: '#454545',
                       textAlign: 'center',
                       border: '0px',
                       fontSize: '12px',
                       color: 'white',
                       fontFamily: "'Montserrat', sans-serif",
                   }}/>
            <div className={'text-element'} style={{fontSize: '14px'}}>Введите резервные коды от аккаунта PSN:</div>
            <div style={{display: 'flex', flexDirection: 'row-'}}>
                <input placeholder={"Код #1"}
                       style={{
                           height: '40px',
                           width: String((window.innerWidth - 60) / 3) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '10px',
                           background: '#454545',
                           textAlign: 'center',
                           border: '0px',
                           fontSize: '18px',
                           color: 'white',
                           fontFamily: "'Montserrat', sans-serif",
                       }}/>
                <input placeholder={"Код #2"}
                       style={{
                           height: '40px',
                           width: String((window.innerWidth - 60) / 3) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '10px',
                           background: '#454545',
                           textAlign: 'center',
                           marginLeft: '7px',
                           marginRight: '7px',
                           border: '0px',
                           fontSize: '18px',
                           color: 'white',
                           fontFamily: "'Montserrat', sans-serif",
                       }}/>
                <input placeholder={"Код #3"}
                       style={{
                           height: '40px',
                           width: String((window.innerWidth - 60) / 3) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '10px',
                           background: '#454545',
                           textAlign: 'center',
                           border: '0px',
                           fontSize: '18px',
                           color: 'white',
                           fontFamily: "'Montserrat', sans-serif",
                       }}/>
            </div>
            <a href={'https://google.com'} className={'link-element'}>
                <div className={'text-element'} style={{fontSize: '9px', color:'#003dff'}}>Где их взять и что это за коды? Инструкция по
                    настройке.
                </div>
            </a>
        </div>)
    }


    if (status === 0) {
        onGetData()
        return (<div className={'pong-loader'} style={{
            border: '2px solid #8cdb8b',
            marginTop: String(height / 2 - 60) + 'px',
            marginLeft: String(window.innerWidth / 2 - 40) + 'px'
        }}>Ожидайте</div>);
    } else if (status === 1) {
        if (basket.length === 0) {
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
                        <Link to={'/home0'} className={'link-element'}>
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
                        height: String(height - 110 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
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
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: '5px',
                                height: '40px'
                            }}>
                                <div
                                    style={{marginTop: '10px', fontSize: '15px', marginLeft: '0', marginRight: '0'}}
                                    className={'text-element'}>Итого:
                                </div>
                                <div
                                    style={{marginTop: '10px', fontSize: '17px', marginLeft: '0', marginRight: '0'}}
                                    className={'text-element'}>{String(sumPrice)} ₽
                                </div>
                            </div>
                        </div>
                        <button className={'all-see-button'} style={{
                            marginTop: '10px',
                            width: String(window.innerWidth - 30) + 'px',
                            background: '#52a557',
                            marginLeft: '0px'
                        }}
                                onClick={() => {
                                    setStatus(2)
                                }}>Перейти к оформлению заказа
                        </button>
                    </div>
                </div>

            );
        }
    } else if (status === 2) {
        return (<div>
            <div style={{marginLeft: '10px', width: String(window.innerWidth - 20) + 'px'}}>
                <div className={'title'} style={{
                    marginLeft: String(window.innerWidth / 2 - 110) + 'px',
                    marginRight: 'auto',
                    marginTop: '10px'
                }}>Оформление заказа
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '5px',
                    height: '40px'
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
                    transitionProperty: 'height',
                    transitionDuration: '0.2s',
                    marginTop: '20px',
                    marginBottom: '20px'
                }}>{menuDesigns}</div>


                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '5px',
                    height: '40px'
                }}>
                    <div className={"text-element"}
                         style={{fontSize: '15px', marginLeft: '0', marginRight: '0',}}>У
                        меня есть промокод:
                    </div>
                    <div style={{
                        width: '200px',
                    }}>
                        <input placeholder={"Введите промокод"}
                               style={{
                                   height: '40px',
                                   width: '200px',
                                   borderRadius: '10px',
                                   background: '#454545',
                                   textAlign: 'center',
                                   border: '0px',
                                   fontSize: '18px',
                                   color: 'white',
                                   fontFamily: "'Montserrat', sans-serif",
                               }}/>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: '5px',
                    height: '40px'
                }}>
                    <div style={{marginTop: '10px', fontSize: '15px', marginLeft: '0', marginRight: '0'}}
                         className={'text-element'}>Итого:
                    </div>
                    <div style={{marginTop: '10px', fontSize: '17px', marginLeft: '0', marginRight: '0'}}
                         className={'text-element'}>{String(sumPrice)} ₽
                    </div>
                </div>
            </div>
            <button className={'all-see-button'} style={{
                marginTop: '10px',
                width: String(window.innerWidth - 30) + 'px',
                background: '#52a557'
            }}
                    onClick={onClickButton}>{buttonText}
            </button>
        </div>)
    } else if (status === 3) {
        return (<div style={{flexDirection: 'column', display: 'flex'}}>
                <div className={'text-element'} style={{
                    marginTop: '200px',
                    width: String(window.innerWidth) + 'px',
                    textAlign: 'center',
                    fontSize: '20px',
                    marginLeft: '0px'
                }}>Заказ
                    успешно оформлен, спасибо!
                </div>
                <div className={'background-heart'}
                     style={{height: '60px', width: '60px', marginLeft: String(window.innerWidth / 2 - 30) + 'px'}}/>
                <div className={'text-element'} style={{
                    width: String(window.innerWidth - 90) + 'px',
                    textAlign: 'center',
                    fontSize: '20px',
                    marginLeft: '45px'
                }}>Совсем скоро с Вами свяжется наш менеджер - @gwstore_admin для оплаты и активации Вашего заказа.
                </div>
                <a className={'link-element text-element'}
                   href={'https://t.me/gwstore_admin'}>
                    <button className={'all-see-button'} style={{
                        marginTop: '15px',
                        height: '50px',
                        marginLeft: '20px',
                        width: String(window.innerWidth - 50) + 'px',
                        background: '#52a557'
                    }}
                            onClick={onClickButton}>Написать менеджеру
                    </button>
                </a>
                <Link to={'/home0'} className={"link-element"}>
                    <button className={'all-see-button'} style={{
                        marginTop: '10px',
                        marginLeft: '25px',
                        height: '50px',
                        width: String(window.innerWidth - 50) + 'px',
                        background: '#454545'
                    }}
                            onClick={onClickButton}>Вернуться на главную
                    </button>
                </Link>
            </div>
        )
    }


};

export default Basket;