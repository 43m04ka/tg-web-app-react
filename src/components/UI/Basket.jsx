import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import ProductItem from "./ProductItem";
import ProductItemBasket from "./ProductItemBasket";
import {useTelegram} from "../../hooks/useTelegram";

let inputData = [null, null, null, null, null]
let promo = ''
let orderId = 0
const Basket = ({height, number, updateOrders}) => {
    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    const [basket, setBasket] = useState([])
    const [myAcc, setMyAcc] = useState(1);
    const [colorYes, setColorYes] = useState([174, 174, 174]);
    const [colorNo, setColorNo] = useState([82, 165, 87]);
    const [status, setStatus] = useState(0);
    const [buttonText, setButtonText] = React.useState('Оформить заказ и оплатить');
    const [promoInput, setPromoInput] = useState('');
    const [promoIsUse, setPromoIsUse] = useState(false);
    const [parcent, setParcent] = useState(0);
    const [promoButtonColor, setPromoButtonColor] = useState([174, 174, 174]);
    const [contactStatus, setContactStatus] = useState(0);
    const [promoButtonText, setPromoButtonText] = useState('ПРИМЕНИТЬ');
    const userRef = useRef();

    let getUse = false
    if (typeof user.username !== 'undefined') {
        getUse = true
    }


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
                            setPromoButtonColor([82, 165, 87])
                            setPromoButtonText('Скидка активна')
                        } else {
                            setPromoIsUse(false)
                            setPromoButtonColor([164, 30, 30])
                            setPromoButtonText('Кол-во исчерпано')
                        }
                    } else {
                        setPromoIsUse(false)
                        setPromoButtonColor([164, 30, 30])
                        setPromoButtonText('Промокод не найден')
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

        try {
            if (typeof user.username === 'undefined') {
                sendDataProduct.user.username = userRef.current.value
            }
        } catch (e) {}


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
                if (r.body === true) {
                    setStatus(3);
                    updateOrders()
                    orderId = r.number
                    promo = ''
                    setPromoIsUse(false)
                    setColorNo([164, 30, 30])
                    setPromoInput('')
                    setParcent(0)
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
                    if (Number(el.body.tab) === number && el.body.isSale) {
                        newArray = [...newArray, el]
                    }
                })
                setBasket(newArray);
                console.log(newArray)
                console.log(r.body)
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
        if (el.body.isSale) {
            sumPrice += el.body.price
        }
    })

    const onclickYes = () => {
        setMyAcc(0);
        setColorYes([81, 164, 86]);
        setColorNo([174, 174, 174]);
    }
    const onclickNo = () => {
        setMyAcc(1);
        setColorNo([81, 164, 86]);
        setColorYes([174, 174, 174]);
    }

    console.log(status)

    const styleYes = {
        background: rgb(colorYes),
        height: '34px',
        border: '0',
        width: String((window.innerWidth - 40) / 2) + 'px',
        borderRadius: '17px',
        textAlign: 'center',
        marginLeft: '0px',
        marginRight: '0px',
        fontSize: '16px',
        transitionProperty: 'background-color',
        transitionDuration: '0.2s',
    }
    const styleNo = {
        background: rgb(colorNo),
        height: '34px',
        border: '0',
        fontSize: '16px',
        width: String((window.innerWidth - 40) / 2) + 'px',
        borderRadius: '17px',
        textAlign: 'center',
        marginLeft: '0px',
        marginRight: '0px',
        transitionProperty: 'background-color',
        transitionDuration: '0.2s',
    }

    const stylePromoButton = {
        background: rgb(promoButtonColor),
        border: '0px white',
        borderRadius: '17px',
        height: '34px',
        color: 'white',
        textAlign: 'center',
        marginRight:'0px',
        marginLeft: '0px',
    }

    let priceElement = (<div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: '5px',
            height: '40px'
        }}>
            <div style={{marginTop: '10px', fontSize: '15px', marginLeft: '5px', marginRight: '0'}}
                 className={'text-element'}>К оплате:
            </div>
            <div style={{marginTop: '10px', fontSize: '17px', marginLeft: '0', marginRight: '5px'}}
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

    let menuDesigns = null
    if (number === 0 && myAcc === 1) {
        menuDesigns = (<div className={'text-element'}
                            style={{
                                textAlign: 'center',
                                marginTop: '5px',
                                lineHeight: '18px',
                                fontWeight: '500',
                                fontSize: '13px',
                                paddingLeft: '10px',
                                paddingRight: '10px'
                            }}>Мы оформим заказ на новый аккаунт PSN и передадим Вам его в полном доступе. Это
            бесплатно.< /div>)
    } else if (number === 0 && myAcc === 0) {
        menuDesigns = (<div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        }}>
            <div className={'text-element'} style={{fontSize: '14px', fontWeight: '500'}}>Введите данные от аккаунта
                PSN:
            </div>
            <input placeholder={'Логин от аккаунта PSN'}
                   style={{
                       height: '34px',
                       width: String(window.innerWidth - 50) + 'px',
                       marginTop: '7px',
                       borderRadius: '17px',
                       background: 'white',
                       textAlign: 'center',
                       border: '0px',
                       fontSize: '16px',
                       color: 'black',
                       fontFamily: "'Montserrat', sans-serif",
                   }} onChange={(event) => inputData[0] = event.target.value}/>
            <input placeholder={"Пароль от аккаунта PSN"}
                   style={{
                       height: '34px',
                       width: String(window.innerWidth - 50) + 'px',
                       marginTop: '7px',
                       marginBottom: '10px',
                       borderRadius: '17px',
                       background: 'white',
                       textAlign: 'center',
                       textWrap: 'wrap',
                       border: '0px',
                       fontSize: '16px',
                       color: 'black',
                       fontFamily: "'Montserrat', sans-serif",
                   }} onChange={(event) => inputData[1] = event.target.value}/>
            <div className={'text-element'} style={{fontSize: '14px', fontWeight: '500'}}>Введите резервные коды от
                аккаунта PSN:
            </div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <input placeholder={"Код #1"}
                       maxLength={6}
                       style={{
                           height: '34px',
                           width: String((window.innerWidth - 64) / 3) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '17px',
                           background: 'white',
                           textAlign: 'center',
                           border: '0px',
                           fontSize: '18px',
                           fontFamily: "'Montserrat', sans-serif",
                       }} onChange={(event) => inputData[2] = event.target.value}/>
                <input placeholder={"Код #2"}
                       maxLength={6}
                       style={{
                           height: '34px',
                           width: String((window.innerWidth - 64) / 3) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '17px',
                           background: 'white',
                           textAlign: 'center',
                           marginLeft: '7px',
                           marginRight: '7px',
                           border: '0px',
                           fontSize: '18px',
                           fontFamily: "'Montserrat', sans-serif",
                       }} onChange={(event) => inputData[3] = event.target.value}/>
                <input placeholder={"Код #3"}
                       maxLength={6}
                       style={{
                           height: '34px',
                           width: String((window.innerWidth - 64) / 3) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '17px',
                           background: 'white',
                           textAlign: 'center',
                           border: '0px',
                           fontSize: '18px',
                           fontFamily: "'Montserrat', sans-serif",
                       }} onChange={(event) => inputData[4] = event.target.value}/>
            </div>
            <a href={'https://t.me/gwstore_faq/10'}
               className={'link-element'}>
                <div className={'text-element'} style={{fontSize: '9px', color: '#559fff', marginBottom: '3px'}}>Где их
                    взять и что это за
                    коды? Инструкция по
                    настройке.
                </div>
            </a>
        </div>)
    }

    if (number === 1 && myAcc === 1) {
        menuDesigns = (<div className={'text-element'}
                            style={{
                                textAlign: 'center',
                                marginTop: '5px',
                                lineHeight: '18px',
                                fontWeight: '500',
                                fontSize: '13px',
                                paddingLeft: '10px',
                                paddingRight: '10px'
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
            <div className={'text-element'} style={{fontSize: '14px', fontWeight: '500'}}>Введите логин и пароль от
                аккаунта Xbox:
            </div>
            <input placeholder={"Введите логин от аккаунта Xbox"}
                   style={{
                       height: '34px',
                       width: String(window.innerWidth - 50) + 'px',
                       marginTop: '10px',
                       borderRadius: '17px',
                       background: 'white',
                       textAlign: 'center',
                       border: '0px',
                       fontSize: '16px',
                       fontFamily: "'Montserrat', sans-serif",
                   }} onChange={(event) => inputData[0] = event.target.value}/>
            <input placeholder={"Введите пароль от аккаунта Xbox"}
                   style={{
                       height: '34px',
                       width: String(window.innerWidth - 50) + 'px',
                       marginTop: '7px',
                       marginBottom: '10px',
                       borderRadius: '17px',
                       background: 'white',
                       textAlign: 'center',
                       textWrap: 'wrap',
                       border: '0px',
                       fontSize: '16px',
                       fontFamily: "'Montserrat', sans-serif",
                   }} onChange={(event) => inputData[1] = event.target.value}/>
            <div className={'text-element'} style={{
                fontSize: '12px',
                textAlign: 'center',
                paddingLeft: '10px',
                paddingRight: '10px',
                fontWeight: '500'
            }}>Введите резервную почту или
                телефон от аккаунта Xbox. Это нужно чтобы отправить код для входа в аккаунт.
            </div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <input placeholder={"Резервная почта"}
                       maxLength={6}
                       style={{
                           height: '34px',
                           width: String((window.innerWidth - 58) / 2) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '17px',
                           background: 'white',
                           textAlign: 'center',
                           border: '0px',
                           marginRight: '4px',
                           fontSize: '16px',
                           fontFamily: "'Montserrat', sans-serif",
                       }} onChange={(event) => inputData[2] = event.target.value}/>
                <input placeholder={"Телефон"}
                       maxLength={6}
                       style={{
                           height: '34px',
                           width: String((window.innerWidth - 58) / 2) + 'px',
                           marginTop: '7px',
                           marginBottom: '10px',
                           borderRadius: '17px',
                           background: 'white',
                           textAlign: 'center',
                           border: '0px',
                           marginLeft: '4px',
                           fontSize: '16px',
                           fontFamily: "'Montserrat', sans-serif",
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
    let selectAcc = (
        <div style={{
            background: '#454545',
            padding: '5px',
            marginTop: '5px',
            borderRadius: '20px', marginBottom: '10px'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '5px',
                padding: '7px'
            }}>
                <div className={"text-element"}
                     style={{fontSize: '17px', marginLeft: '0', marginBottom: '10px', marginTop: '3px'}}>Куда оформить
                    заказ?
                </div>
                <div style={{
                    width: String(window.innerWidth - 40) + 'px',
                    display: 'flex',
                    flexDirection: 'row',
                    background: '#aeaeae',
                    borderRadius: '17px',
                }}>
                    <button onClick={onclickYes} className={'text-element'} style={styleYes}>На мой аккаунт
                    </button>
                    <button onClick={onclickNo} className={'text-element'} style={styleNo}>Новый аккаунт
                    </button>
                </div>
            </div>
            <div style={{
                transitionProperty: 'height',
                transitionDuration: '0.2s',
                marginTop: '7px',
                marginBottom: '7px'
            }}>{menuDesigns}</div>
        </div>
    )

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

    let usernameInput = (<></>)
    let usernameInput1 = (<></>)

    if (typeof user.username === 'undefined') {
        if(contactStatus === 0){
            usernameInput1 = (<div style={{
                width: String(window.innerWidth - 40) + 'px',
                display: 'flex',
                flexDirection: "row",
                justifyContent: 'space-between',
                marginBottom:'4px'
            }}>
                <button className={'text-element'} style={{
                    background: rgb([41, 165, 229]),
                    border: '0px white',
                    borderRadius: '17px',
                    height: '34px',
                    color: 'white',
                    textAlign: 'center',
                    marginRight: '0px',
                    marginLeft: '0px',
                    width: String((window.innerWidth - 65) / 3) + 'px',
                }} onClick={()=>{setContactStatus(1)}}>Telegram
                </button>
                <button className={'text-element'} style={{
                    background: rgb([81, 164, 86]),
                    border: '0px white',
                    borderRadius: '17px',
                    height: '34px',
                    color: 'white',
                    textAlign: 'center',
                    marginRight: '0px',
                    marginLeft: '0px',
                    width: String((window.innerWidth - 65) / 3) + 'px',
                }} onClick={()=>{setContactStatus(2)}}>WhatsApp
                </button>
                <button className={'text-element'} style={{
                    background: rgb([47, 47, 47]),
                    border: '1px gray solid',
                    borderRadius: '17px',
                    height: '34px',
                    color: 'white',
                    textAlign: 'center',
                    marginRight: '0px',
                    marginLeft: '0px',
                    width: String((window.innerWidth - 65) / 3) + 'px',
                }} onClick={()=>{setContactStatus(3)}}>E-Mail
                </button>
            </div>)
        }if(contactStatus===1){
            usernameInput1= (<div style={{
                display: 'grid',
                gridTemplateColumns: '7fr 3fr',
                width: String(window.innerWidth - 40) + 'px',
                background: 'white',
                borderRadius: '19px',
                border:'2px solid #29a5e5'
            }}>
                <input placeholder={"Ваш никнейм Telegram @name"}
                       className={'text-element'}
                       style={{
                           height: '34px',
                           marginLeft: '0px',
                           marginTop: '0px',
                           borderTopLeftRadius: '17px',
                           borderBottomLeftRadius: '17px',
                           border: '0',
                           textAlign: 'center',
                           color: "black"
                       }} ref={userRef}/>
                <button className={'text-element'} style={{
                    background: rgb([174, 174, 174]),
                    border: '0px white',
                    borderRadius: '17px',
                    height: '34px',
                    color: 'white',
                    textAlign: 'center',
                    marginRight:'0px',
                    marginLeft: '0px',
                }}
                        onClick={() => {
                            setContactStatus(0)
                        }}>НАЗАД
                </button>
            </div>)
        }if(contactStatus===2){
            usernameInput1= (<div style={{
                display: 'grid',
                gridTemplateColumns: '7fr 3fr',
                width: String(window.innerWidth - 40) + 'px',
                background: 'white',
                borderRadius: '19px',
                border:'2px solid #51a456'
            }}>
                <input placeholder={"Ваш контакт WhatsApp"}
                       className={'text-element'}
                       style={{
                           height: '34px',
                           marginLeft: '0px',
                           marginTop: '0px',
                           borderTopLeftRadius: '17px',
                           borderBottomLeftRadius: '17px',
                           border: '0',
                           textAlign: 'center',
                           color: "black"
                       }} ref={userRef}/>
                <button className={'text-element'} style={{
                    background: rgb([174, 174, 174]),
                    border: '0px white',
                    borderRadius: '17px',
                    height: '34px',
                    color: 'white',
                    textAlign: 'center',
                    marginRight:'0px',
                    marginLeft: '0px',
                }}
                        onClick={() => {
                            setContactStatus(0)
                        }}>НАЗАД
                </button>
            </div>)
        }if(contactStatus===3){
            usernameInput1= (<div style={{
                display: 'grid',
                gridTemplateColumns: '7fr 3fr',
                width: String(window.innerWidth - 40) + 'px',
                background: 'white',
                borderRadius: '19px',
                border:'2px solid #171717'
            }}>
                <input placeholder={"Ваша почта E-Mail"}
                       className={'text-element'}
                       style={{
                           height: '34px',
                           marginLeft: '0px',
                           marginTop: '0px',
                           borderTopLeftRadius: '17px',
                           borderBottomLeftRadius: '17px',
                           border: '0',
                           textAlign: 'center',
                           color: "black"
                       }} ref={userRef}/>
                <button className={'text-element'} style={{
                    background: rgb([174, 174, 174]),
                    border: '0px white',
                    borderRadius: '17px',
                    height: '34px',
                    color: 'white',
                    textAlign: 'center',
                    marginRight:'0px',
                    marginLeft: '0px',
                }}
                        onClick={() => {
                            setContactStatus(0)
                        }}>НАЗАД
                </button>
            </div>)
        }
        usernameInput = (<div style={{
            background: '#454545',
            padding: '5px',
            borderRadius: '17px', marginBottom: '10px',
            justifyItems: 'center',
            marginTop: '10px'
        }}>
            <div className={'text-element'}
                 style={{fontSize: '16px', textAlign: 'center', marginBottom: '6px'}}>Контакты для связи:
            </div>
            {usernameInput1}
        </div>)
    }


    if (status === 0) {
        onGetData()
        return (<div className={'plup-loader'} style={{
            marginTop: String(height / 2 - 50) + 'px',
            marginLeft: String(window.innerWidth / 2 - 50) + 'px'
        }}></div>);
    } else if (status === 1) {
        if (basket.length === 0) {
            return (
                <div style={{display: 'grid'}}>
                    <div style={{
                        height: String(height - 60 - 15 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
                        marginTop: '15px', textAlign: 'center',
                        color: 'gray', fontSize: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }} className={'text-element'}>
                        <div className={'background-basketSaid'} style={{width: '65px', height: '83px'}}/>
                        <div className={'text-element'}>В корзине ничего нет...</div>
                    </div>
                    <Link to={'/home0'} className={'link-element'}>
                        <button className={'all-see-button'} style={{marginTop: '10px', width: String(300) + 'px'}}>На
                            главную
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
                            <ProductItemBasket key={el.id} setBasketF={setBasket} product={el} number={number}/>
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
                                marginLeft: '0px',
                                height:'38px',
                                borderRadius:'19px',
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
                {selectAcc}
                <div style={{
                    marginTop: '5px',
                    background: '#454545',
                    borderRadius: '17px',
                    padding:'7px 0px 7px 0px',
                    height: '48px',
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '7fr 5fr',
                        width:String(window.innerWidth - 40) + 'px',
                        background:'white',
                        borderRadius: '17px',
                        marginLeft:'10px'
                    }}>
                        <input placeholder={"Промокод"} value={promoInput}
                               className={'text-element'}
                               style={{
                                   height: '34px',
                                   marginLeft:'0px',
                                   marginTop: '0px',
                                   borderTopLeftRadius: '17px',
                                   borderBottomLeftRadius: '17px',
                                   border: '0',
                                   textAlign: 'center',
                                   color: "black"
                               }} onChange={(event) => {
                            if (!promoIsUse) {
                                setPromoInput(event.target.value.toUpperCase());
                            }
                        }}
                               onClick={() => {
                                   if (!promoIsUse) {
                                       setPromoButtonColor([147, 147, 147]);
                                       setPromoButtonText('ПРИМЕНИТЬ');
                                       setPromoInput('')
                                       setPromoIsUse(null)
                                   }
                               }}/>
                        <button className={'text-element'} style={stylePromoButton}
                                onClick={() => {
                                    sendRequestPromo()
                                }}>{promoButtonText}
                        </button>
                    </div>
                </div>
                {usernameInput}

                {priceElement}
            </div>
            <button className={'all-see-button'} style={{
                marginTop: '5px',
                width: String(window.innerWidth - 30) + 'px',
                background: '#52a557',
                height:'38px',
                borderRadius:'19px',
                marginBottom:'2px'
            }}
                    onClick={onClickButton}>{buttonText}
            </button>
            <div className={'text-element'} style={{fontSize: '9px', textAlign: 'center', marginLeft:'30px', marginRight:'30px'}}>
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
                }}>{'Заказ №' + String(orderId) + ' успешно оформлен, спасибо!'}
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