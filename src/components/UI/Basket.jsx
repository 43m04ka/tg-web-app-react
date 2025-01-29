import React, {useCallback, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import ProductItem from "./ProductItem";
import ProductItemBasket from "./ProductItemBasket";
import {useTelegram} from "../../hooks/useTelegram";

let inputData = [null, null, null, null, null]
let promo = ''
const Basket = ({height, number}) => {
    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    console.log(user)

    const [basket, setBasket] = useState([])
    const [myAcc, setMyAcc] = useState(0);
    const [myPromo, setMyPromo] = useState(1);
    const [colorYes, setColorYes] = useState([81, 164, 86]);
    const [colorNo, setColorNo] = useState([45, 12, 12]);
    const [colorYesPromo, setColorYesPromo] = useState([12, 45, 12]);
    const [colorNoPromo, setColorNoPromo] = useState([164, 30, 30]);
    const [status, setStatus] = useState(0);
    const [buttonText, setButtonText] = React.useState('Оформить заказ и оплатить');
    const [promoInput, setPromoInput] = useState('');
    const [promoIsUse, setPromoIsUse] = useState(false);
    const [parcent, setParcent] = useState(0);
    const [promoMassage, setPromoMassage] = useState('');


    let dataRequestPromo = {
        method: 'use',
        data: {str: promoInput},
    }

    const sendRequestPromo = useCallback(() => {
        console.log(dataRequestPromo, 'inputRequestDb')
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/promo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataRequestPromo)
        }).then(r => {
            let Promise = r.json()
            Promise.then(prom => {
                console.log(prom, 'возвратил get')
                if (dataRequestPromo.method === 'use') {
                    if (prom.answer === true) {
                        if (prom.parcent !== 0) {
                            setPromoIsUse(true)
                            setParcent(prom.parcent)
                            promo = promoInput
                            console.log('yes')
                            setPromoMassage('Успешное применение')
                        } else {
                            setPromoMassage('Количество использований исчерпано')
                            console.log('yes1')
                        }
                    } else {
                        setPromoMassage('Промокод не найден')
                        console.log('no')
                    }
                }
            })
        })
    }, [dataRequestPromo])


    const sendDataProduct = {
        method: 'buy',
        user: user,
        accData: '',
        promo: promo,
        page: number,
    }

    const onRegDataAcc = () => {
        if (number === 0) {
            if (myAcc === 1) {
                sendDataProduct.accData = 'Нет своего аккаунта PSN.'
            } else {
                sendDataProduct.accData = 'Логин: ' + inputData[0] + '\n' + 'Пароль: ' + inputData[1] + '\n' + 'Резервные коды: ' + inputData[2] + ', ' + inputData[3] + ', ' + inputData[4]
            }
        } else if (number === 1) {
            if (myAcc === 1) {
                sendDataProduct.accData = 'Нет своего аккаунта Xbox.'
            } else {
                sendDataProduct.accData = 'Логин: ' + inputData[0] + '\n' + 'Пароль: ' + inputData[1] + '\n' + 'Резервные почта: ' + inputData[2] + '\n' + 'Резервный номер телефона: ' + inputData[3]
            }
        }
    }

    function rgb([r, g, b]) {
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).substring(1);
    }

    const onClickButton = useCallback(() => {
        setButtonText('Оформляем заказ...');
        onRegDataAcc();
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
                promo = ''
                setPromoIsUse(false)
                setColorYesPromo([12, 45, 12])
                setColorNo([164, 30, 30])
                setPromoInput('')
                setParcent(0)
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
                    if (Number(el.body.tab) === number) {
                        newArray = [...newArray, el]
                    }
                })
                setBasket(newArray);
                setStatus(1)
            })
        })
    }, [sendData])

    let onBack = useCallback(async () => {
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
        return sumPrice += el.body.price
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

    const onclickYesPromo = () => {
        setMyPromo(0);
        setColorYesPromo([81, 164, 86]);
        setColorNoPromo([45, 12, 12]);
    }
    const onclickNoPromo = () => {
        setMyPromo(1);
        setColorNoPromo([164, 30, 30]);
        setColorYesPromo([12, 45, 12]);
    }

    console.log(status)

    const styleYes = {background: rgb(colorYes), height: '37px'}
    const styleNo = {background: rgb(colorNo), height: '37px'}

    const styleYesPromo = {background: rgb(colorYesPromo), height: '37px'}
    const styleNoPromo = {background: rgb(colorNoPromo), height: '37px'}

    let priceElement = (<div style={{
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
    )
    if (promoIsUse) {
        priceElement = (<div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: '5px',
            height: '40px'
        }}>
            <div style={{marginTop: '10px', fontSize: '15px', marginLeft: '0', marginRight: '0'}}
                 className={'text-element'}>Итого:
            </div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <div style={{marginTop: '10px', fontSize: '17px', marginLeft: '0', marginRight: '15px'}}
                     className={'text-element'}>{String(sumPrice - sumPrice * (parcent / 100))} ₽
                </div>
                <div style={{
                    marginTop: '10px',
                    fontSize: '17px',
                    marginLeft: '0',
                    marginRight: '0',


                    textDecoration: 'line-through',
                    color: 'gray',
                }}
                     className={'text-element'}>{String(sumPrice)} ₽
                </div>
            </div>
        </div>)
    }

    let promoElement = (<div>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '5px',
            height: '40px'
        }}>
            <div>
                <div style={{
                    width: '200px',
                }}>
                    <input placeholder={"Введите промокод"}
                           style={{
                               height: '38px',
                               width: '200px',
                               borderRadius: '10px',
                               background: '#454545',
                               textAlign: 'center',
                               border: '0px',
                               fontSize: '18px',
                               color: 'white',
                               fontFamily: "'Montserrat', sans-serif",
                           }} onChange={(event) => {
                        setPromoInput(event.target.value.toUpperCase());
                    }}/>
                </div>
            </div>
            <button className={'text-element'} style={{
                color: 'black',
                background: 'white',
                border: '0px',
                borderRadius: '10px',
                width: '120px',
                height: '37px',
                marginLeft: '7px',
                textAlign: 'center',
            }}
                    onClick={() => {
                        sendRequestPromo()
                    }}>Применить
            </button>
        </div>
        <div className={'text-element'} style={{textAlign: 'center'}}>{promoMassage}</div>
    </div>)

    if (myPromo) {
        promoElement = (<div></div>)
    }

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
            <input placeholder={"Введите логин от аккаунта PSN"}
                   style={{
                       height: '40px',
                       width: String(window.innerWidth - 20) + 'px',
                       marginTop: '10px',
                       borderRadius: '10px',
                       background: '#454545',
                       textAlign: 'center',
                       border: '0px',
                       fontSize: '16px',
                       color: 'white',
                       fontFamily: "'Montserrat', sans-serif",
                   }} onChange={(event) => inputData[0] = event.target.value}/>
            <input placeholder={"Введите пароль от аккаунта PSN"}
                   style={{
                       height: '40px',
                       width: String(window.innerWidth - 20) + 'px',
                       marginTop: '7px',
                       marginBottom: '10px',
                       borderRadius: '10px',
                       background: '#454545',
                       textAlign: 'center',
                       textWrap: 'wrap',
                       border: '0px',
                       fontSize: '16px',
                       color: 'white',
                       fontFamily: "'Montserrat', sans-serif",
                   }} onChange={(event) => inputData[1] = event.target.value}/>
            <div className={'text-element'} style={{fontSize: '14px'}}>Введите резервные коды от аккаунта PSN:</div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <input placeholder={"Код #1"}
                       maxLength={6}
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
                       }} onChange={(event) => inputData[2] = event.target.value}/>
                <input placeholder={"Код #2"}
                       maxLength={6}
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
                       }} onChange={(event) => inputData[3] = event.target.value}/>
                <input placeholder={"Код #3"}
                       maxLength={6}
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
                       }} onChange={(event) => inputData[4] = event.target.value}/>
            </div>
            <a href={'https://t.me/gwstore_faq/10'}
               className={'link-element'}>
                <div className={'text-element'} style={{fontSize: '9px', color: '#559fff'}}>Где их взять и что это за
                    коды? Инструкция по
                    настройке.
                </div>
            </a>
        </div>)
    }

    if (number === 1 && myAcc === 1) {
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
                            }}>Мы оформим заказ на новый аккаунт Xbox и передадим Вам его в полном доступе. Это
            бесплатно.< /div>)
    } else if (number === 1 && myAcc === 0) {
        menuDesigns = (<div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '5px',
            overflow: 'hidden',
        }}>
            <div className={'text-element'} style={{fontSize: '14px'}}>Введите логин и пароль от аккаунта Xbox:</div>
            <input placeholder={"Введите логин от аккаунта Xbox"}
                   style={{
                       height: '40px',
                       width: String(window.innerWidth - 20) + 'px',
                       marginTop: '10px',
                       borderRadius: '10px',
                       background: '#454545',
                       textAlign: 'center',
                       border: '0px',
                       fontSize: '16px',
                       color: 'white',
                       fontFamily: "'Montserrat', sans-serif",
                   }} onChange={(event) => inputData[0] = event.target.value}/>
            <input placeholder={"Введите пароль от аккаунта Xbox"}
                   style={{
                       height: '40px',
                       width: String(window.innerWidth - 20) + 'px',
                       marginTop: '7px',
                       marginBottom: '10px',
                       borderRadius: '10px',
                       background: '#454545',
                       textAlign: 'center',
                       textWrap: 'wrap',
                       border: '0px',
                       fontSize: '16px',
                       color: 'white',
                       fontFamily: "'Montserrat', sans-serif",
                   }} onChange={(event) => inputData[1] = event.target.value}/>
            <div className={'text-element'} style={{fontSize: '12px', textAlign: 'center'}}>Введите резервную почту или
                телефон от аккаунта Xbox. Это нужно чтобы отправить код для входа в аккаунт.
            </div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <input placeholder={"Резервная почта"}
                       maxLength={6}
                       style={{
                           height: '40px',
                           width: String((window.innerWidth - 45) / 2) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '10px',
                           background: '#454545',
                           textAlign: 'center',
                           border: '0px',
                           fontSize: '16px',
                           color: 'white',
                           fontFamily: "'Montserrat', sans-serif",
                       }} onChange={(event) => inputData[2] = event.target.value}/>
                <input placeholder={"Телефон"}
                       maxLength={6}
                       style={{
                           height: '40px',
                           width: String((window.innerWidth - 45) / 2) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '10px',
                           background: '#454545',
                           textAlign: 'center',
                           marginLeft: '7px',
                           marginRight: '7px',
                           border: '0px',
                           fontSize: '16px',
                           color: 'white',
                           fontFafmily: "'Montserrat', sans-serif",
                       }} onChange={(event) => inputData[3] = event.target.value}/>
            </div>
            <a href={'https://t.me/gwstore_faq/9'}
               className={'link-element'}>
                <div className={'text-element'} style={{fontSize: '9px', color: '#559fff'}}>Если этот параметр не
                    настроен. Инструкция.
                </div>
            </a>
        </div>)
    }

    let titleText = null
    let selectAcc = (<div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '5px',
        height: '40px'
    }}>
        <div className={"text-element"}
             style={{fontSize: '15px', marginLeft: '0',}}>У
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
    </div>)

    if (number === 0) {
        titleText = 'Ваша корзина Playstation'
    }
    if (number === 1) {
        titleText = 'Ваша корзина Xbox'
    }
    if (number === 2) {
        titleText = 'Ваша корзина Сервисы'
        selectAcc = (<></>)
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
                        marginTop: '15px', width: String(window.innerWidth) + 'px', textAlign: 'center',
                        color: 'gray', fontSize: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }} className={'text-element'}>
                        <div className={'background-basketSaid'} style={{width: '65px', height: '83px'}}/>
                        <div className={'text-element'}>В корзине ничего нет...</div>
                    </div>
                    <Link to={'/home0'} className={'link-element'} style={{marginTop:"75px"}}>
                        <button className={'all-see-button'} style={{marginTop: '10px', width:String(window.innerWidth-40)+'px'}}>На главную
                        </button>
                    </Link>
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
                        overflow: 'scroll'
                    }}>
                        <div className={'title'} style={{
                            width: String(window.innerWidth) + 'px', textAlign: 'center',
                            marginRight: 'auto',
                            marginTop: '10px',
                            marginLeft: '0',
                        }}>{titleText}
                        </div>
                        {basket.map(el => (
                            <ProductItemBasket key={el.id} setBasketF={setBasket} product={el}/>
                        ))}
                    </div>
                    <div style={{borderTop: '2px solid gray'}}>
                        <div style={{marginLeft: '15px'}}>
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
                </div>

            );
        }
    } else if (status === 2) {
        return (<div>
            <div style={{marginLeft: '10px', width: String(window.innerWidth - 20) + 'px'}}>
                <div className={'title'} style={{
                    width: String(window.innerWidth - 40) + 'px', textAlign: 'center',
                    marginLeft: '0',
                    marginTop: '10px'
                }}>Оформление заказа
                </div>
                {selectAcc}
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
                         style={{fontSize: '15px', marginLeft: '0',}}>У
                        меня есть промокод:
                    </div>
                    <div style={{
                        width: '140px',
                        justifyContent: 'space-between',
                        display: 'flex',
                        flexDirection: 'row',
                    }}>
                        <div
                            style={{width: '65px'}}>
                            <button className={'selector-button'} onClick={onclickYesPromo} style={styleYesPromo}>Да
                            </button>
                        </div>
                        <div
                            style={{width: '65px'}}>
                            <button className={'selector-button'} onClick={onclickNoPromo} style={styleNoPromo}>Нет
                            </button>
                        </div>
                    </div>
                </div>
                {promoElement}
                {priceElement}
            </div>
            <button className={'all-see-button'} style={{
                marginTop: '10px',
                width: String(window.innerWidth - 30) + 'px',
                background: '#52a557'
            }}
                    onClick={onClickButton}>{buttonText}
            </button>
            <div className={'text-element'} style={{fontSize: '9px', textAlign: 'center'}}>
                Нажимая на кнопку, Вы соглашаетесь с <a href={'https://t.me/gwstore_faq/12'} style={{color: '#559fff'}}
                                                        className={'link-element'}>Условиями
                обработки персональных данных</a>, а также с <a href={'https://t.me/gwstore_faq/11'}
                                                                style={{color: '#559fff'}} className={'link-element'}>Пользовательским
                соглашением</a>
            </div>
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
                        marginLeft: '18px',
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