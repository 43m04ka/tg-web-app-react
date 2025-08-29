import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import ProductItem from "../../ProductItem";
import ProductItemBasket from "./ProductItemBasket";
import {useTelegram} from "../../../../hooks/useTelegram";
import {useServerUser} from "../../../../hooks/useServerUser";
import useGlobalData from "../../../../hooks/useGlobalData";
import {concatAll} from "rxjs";
import IndiaCount from "./IndiaCount";

let inputData = [null, null, null, null, null]
let promo = ''
let orderId = 0
const Basket = ({height, number}) => {
    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    const {pageId, catalogList, updateCounterBasket} = useGlobalData()
    const {getBasketList} = useServerUser()

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
    const [alertElement, setAlertElement] = useState(<div></div>);
    const [freeGameStatus, setFreeGameStatus] = useState(0)

    const [sumPrice, setSumPrice] = useState(0)

    const onReload = () =>{
        getBasketList((result)=>{
            let catalogIdList = []
            catalogList.forEach(catalog=>{
                if(catalog.structurePageId === pageId){
                    catalogIdList.push(catalog.id)
                }
            })
            let cardList = []
            result.forEach(card=>{
                if(catalogIdList.includes(card.catalogId)){
                    cardList.push(card)
                }
            })
            setBasket(cardList)
            setStatus(1)
            updateCounterBasket(catalogList, pageId)
        }, user.id).then()
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
        page: pageId,
    }

    const onRegDataAcc = () => {
        if (number === 0 || number === 3) {
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
        try {
            if (typeof user.username === 'undefined') {
                sendDataProduct.user.username = '@' + userRef.current.value
            }
        } catch (e) {
        }


        if (typeof sendDataProduct.user.username !== 'undefined' && sendDataProduct.user.username !== '') {
            setButtonText('Оформляем заказ...');
            if (typeof user.username === 'undefined') {
                sendDataProduct.user.username = userRef.current.value
                if (contactStatus === 1) {
                    sendDataProduct.user.username = '@' + sendDataProduct.user.username
                }
            }
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
        } else {
            if (typeof sendDataProduct.user.username === 'undefined') {
                setAlertElement(<div className={'text-element'} style={{
                    color: '#ef7474',
                    textAlign: 'center',
                    marginLeft: '10px',
                    paddingTop: '3px'
                }}>Выберете мессенджер и оставьте ваш контакт для дальнейшего оформления заказа</div>)
            }
        }
    }, [sendDataProduct])


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

    if(number !== 3) {
        let summ = 0
        basket.map(el => {
            if (el.onSale) {
                summ += el.similarCard?.price || el.price
            }
        })
        if(sumPrice !== summ){
            setSumPrice(summ)
        }
    }

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
        marginRight: '0px',
        marginLeft: '0px',
    }

    let freeGameElement = (<></>)

    if(freeGameStatus === 1 && false){
        freeGameElement= (
            <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: '5px',
            background: '#232323',
            borderRadius: '10px',
            margin: '10px 0 0 10px',
            width: String(window.innerWidth - 20) + 'px'
        }}>
            <Link to={'/freegame'} className={'link-element'}
                  style={{display: 'flex', flexDirection: 'row', justifyContent: 'left'}}>
                <div className={'img'} style={{
                    height: '80px',
                    width: '80px',
                    borderRadius: '7px',
                    backgroundImage: 'url("data:image/png;base64,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ivz6BaGHEbEeQRDaIeW9giAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh4gDIAiCIAh9iDgAgiAIgtCHiAMgCIIgCH2IOACCIAiC0IeIAyAIgiAIfYg4AIIgCILQh/z/o4PXO98IuMkAAAAASUVORK5CYII=")',
                    backgroundSize: 'cover',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'end',
                    justifyContent: 'space-between',
                }}></div>
                <div style={{
                    width: String(window.innerWidth - 140) + 'px',
                    display: 'grid',
                    gridTemplateRows: '15fr 30px 15fr',
                    height: '75px'
                }}>
                    <div className={'text-element text-basket'} style={{
                        marginTop: '5px',
                        lineHeight: '15px',
                        height: '15px',
                        fontSize: '13px',
                        overflow: 'hidden',
                        display: 'flex',
                    }}>{'Игра в кубик рулетка'}</div>
                    <div className={'text-element'} style={{
                        fontSize: '13px',
                        color: '#696969',
                        overflow: 'hidden',
                        lineHeight: '15px',
                        height: '30px',
                        marginTop: '0px'
                    }}>
                        {'Бесплатная игра при заказе игр от 1000р'}
                    </div>
                    <div style={{
                        marginTop: '0px',
                        display: 'flex',
                        justifyContent: 'left',
                        alignItems: 'center',
                        height: '15px'
                    }}>
                        <div className={'text-element text-basket'} style={{
                            lineHeight: '15px',
                            marginTop: '15px',
                            height: '15px',
                            fontSize: '15px',
                            color: 'white',
                            marginRight:'0px'
                        }}>{'0 ₽'}</div>
                    </div>
                </div>
            </Link>
            <div onClick={() => {

            }} style={{justifyContent: 'center', alignContent: "center", marginRight: '20px'}}>
                <div className={'background-arrow'}
                     style={{padding: '10px', height: '20px', width: '20px'}}>
                </div>
            </div>
        </div>)
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
    if ((number === 0 || number === 3) && myAcc === 1) {
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
    } else if ((number === 0 || number === 3) && myAcc === 0) {
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

    if ((number === 0 || number === 3)) {
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
        if (contactStatus === 0) {
            usernameInput1 = (<div style={{
                width: String(window.innerWidth - 40) + 'px',
                display: 'flex',
                flexDirection: "row",
                justifyContent: 'space-between',
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
                }} onClick={() => {
                    setContactStatus(1)
                }}>Telegram
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
                }} onClick={() => {
                    setContactStatus(2)
                }}>WhatsApp
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
                }} onClick={() => {
                    setContactStatus(3)
                }}>E-Mail
                </button>
            </div>)
        }
        if (contactStatus === 1) {
            usernameInput1 = (<div style={{
                display: 'grid',
                gridTemplateColumns: '7fr 3fr',
                width: String(window.innerWidth - 40) + 'px',
                background: 'white',
                borderRadius: '17px',
                border: '2px solid #29a5e5'
            }}>
                <input placeholder={"Ваш никнейм Telegram @name"}
                       className={'text-element'}
                       style={{
                           height: '30px',
                           marginLeft: '0px',
                           marginTop: '0px',
                           borderTopLeftRadius: '15px',
                           borderBottomLeftRadius: '15px',
                           border: '0',
                           textAlign: 'center',
                           color: "black"
                       }} ref={userRef} onChange={() => {
                    setAlertElement(<div></div>)
                }}/>
                <button className={'text-element'} style={{
                    background: rgb([174, 174, 174]),
                    border: '0px white',
                    borderRadius: '15px',
                    height: '30px',
                    color: 'white',
                    textAlign: 'center',
                    marginRight: '0px',
                    marginLeft: '0px',
                }}
                        onClick={() => {
                            setContactStatus(0)
                            setAlertElement(<div></div>)
                        }}>НАЗАД
                </button>
            </div>)
        }
        if (contactStatus === 2) {
            usernameInput1 = (<div style={{
                display: 'grid',
                gridTemplateColumns: '7fr 3fr',
                width: String(window.innerWidth - 40) + 'px',
                background: 'white',
                borderRadius: '17px',
                border: '2px solid #51a456'
            }}>
                <input placeholder={"Ваш контакт WhatsApp"}
                       className={'text-element'}
                       style={{
                           height: '30px',
                           marginLeft: '0px',
                           marginTop: '0px',
                           borderTopLeftRadius: '15px',
                           borderBottomLeftRadius: '15px',
                           border: '0',
                           textAlign: 'center',
                           color: "black"
                       }} ref={userRef} onChange={() => {
                    setAlertElement(<div></div>)
                }}/>
                <button className={'text-element'} style={{
                    background: rgb([174, 174, 174]),
                    border: '0px white',
                    borderRadius: '15px',
                    height: '30px',
                    color: 'white',
                    textAlign: 'center',
                    marginRight: '0px',
                    marginLeft: '0px',
                }}
                        onClick={() => {
                            setContactStatus(0)
                            setAlertElement(<div></div>)
                        }}>НАЗАД
                </button>
            </div>)
        }
        if (contactStatus === 3) {
            usernameInput1 = (<div style={{
                display: 'grid',
                gridTemplateColumns: '7fr 3fr',
                width: String(window.innerWidth - 40) + 'px',
                background: 'white',
                borderRadius: '17px',
                border: '2px solid #171717'
            }}>
                <input placeholder={"Ваша почта E-Mail"}
                       className={'text-element'}
                       style={{
                           height: '30px',
                           marginLeft: '0px',
                           marginTop: '0px',
                           borderTopLeftRadius: '15px',
                           borderBottomLeftRadius: '15px',
                           border: '0',
                           textAlign: 'center',
                           color: "black"
                       }} ref={userRef} onChange={() => {
                    setAlertElement(<div></div>)
                }}/>
                <button className={'text-element'} style={{
                    background: rgb([174, 174, 174]),
                    border: '0px white',
                    borderRadius: '15px',
                    height: '30px',
                    color: 'white',
                    textAlign: 'center',
                    marginRight: '0px',
                    marginLeft: '0px',
                }}
                        onClick={() => {
                            setContactStatus(0)
                            setAlertElement(<div></div>)
                        }}>НАЗАД
                </button>
            </div>)
        }
        usernameInput = (<div style={{
            background: '#454545',
            borderRadius: '17px', marginBottom: '10px',
            marginTop: '10px',
            paddingTop: '7px',
            paddingBottom: '5px',
        }}>
            <div className={'text-element'}
                 style={{fontSize: '16px', textAlign: 'center', marginBottom: '6px'}}>Контакты для связи:
            </div>
            <div style={{marginLeft: '10px', marginBottom: '5px'}}>
                {usernameInput1}
                {alertElement}
            </div>
        </div>)
    }


    if (status === 0) {
        onReload()
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
                    <Link to={'/'} className={'link-element'}>
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
                        height: number !== 3 ? String(height - 110 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px' : 'max-content',
                        overflow: 'scroll',
                    }}>
                        <div className={'title'} style={{
                            width: String(window.innerWidth) + 'px',
                            textAlign: 'center',
                            marginRight: 'auto',
                            marginTop: '10px',
                            marginLeft: '0',
                        }}>{titleText}
                        </div>
                        {basket.map(el =>
                            {return (pageId === 31 && el.priceInOtherCurrency !== null) || pageId !== 31 ? <ProductItemBasket key={el.id} product={el} onReload={onReload} page={number}/> : ''}
                        )}
                        {freeGameElement}
                        <div>
                            <div style={{height: '10px'}}/>
                        </div>
                    </div>
                    <div style={{
                        background: '#232323',
                        borderRadius: '18px',
                        borderTop: '2px solid #353535',
                        width:'100%'
                    }}>
                        {number === 3 ? <IndiaCount basketList = {basket} setSum={setSumPrice}/> : ''}
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
                                height: '38px',
                                borderRadius: '19px',
                                marginBottom: '15px'
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
                    padding: '7px 0px 7px 0px',
                    height: '48px',
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '7fr 5fr',
                        width: String(window.innerWidth - 40) + 'px',
                        background: 'white',
                        borderRadius: '17px',
                        marginLeft: '10px'
                    }}>
                        <input placeholder={"Промокод"} value={promoInput}
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
                height: '38px',
                borderRadius: '19px',
                marginBottom: '2px'
            }}
                    onClick={onClickButton}>{buttonText}
            </button>
            <div className={'text-element'}
                 style={{fontSize: '9px', textAlign: 'center', marginLeft: '30px', marginRight: '30px'}}>
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
                <Link to={'/'} className={"link-element"}>
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