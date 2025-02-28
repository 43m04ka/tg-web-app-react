import React, {createRef, useCallback, useEffect, useState} from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import {Link, useNavigate, useParams} from "react-router-dom";
import HomeBlock from "./HomeBlock";
import HomeBlockElement from "./HomeBlockElement";
import ProductItem from "./ProductItem";

let heightText = null
let textElementHeight = null
const CardProduct = ({mainData, basketData, setDataDop, dataDop, onGetData}) => {
    let dataRequestDatabase = {
        method: 'getRandom',
        data: mainData.body.tab
    }

    const sendRequestDatabase = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataRequestDatabase)
        }).then(r => {
            let Promise = r.json()
            Promise.then(prom => {
                setDataCards(prom.cards)
                try {
                    setDataDop([...prom.cards, ...dataDop])
                } catch (e) {
                    setDataDop(prom.cards)
                }
                onGetData()
            })
        })
    }, [dataRequestDatabase])

    const {tg, user} = useTelegram();
    const refText = createRef();
    const navigate = useNavigate();

    const [newMainData, setNewMainData] = useState(mainData)
    const [isBuy, setIsBuy] = React.useState(null);
    const [textHidden, setTextHidden] = React.useState(null);
    const [dataCards, setDataCards] = React.useState([]);

    if (mainData.id !== newMainData.id) {
        setNewMainData(mainData)
        setTextHidden(null)
        setIsBuy(false);
        sendRequestDatabase();
        heightText = null
        textElementHeight = null
        window.scroll(0, 0)
    }

    useEffect(() => {
        sendRequestDatabase()
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

    const onBasket = useCallback(async () => {
        navigate('/basket' + newMainData.body.tab);
    }, [])

    useEffect(() => {
        tg.BackButton.show();
    }, [])

    const sendData = {
        method: 'add',
        mainData: newMainData.id,
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
            Promise.then(prom => {
                const result = prom.body
                if (result) {
                    setIsBuy(true)
                }
            })
        })
    }, [sendData])


    let buttonColor
    let buttonText
    let buttonLink

    if (newMainData.body.isSale === true) {
        let flag = true
        basketData.map(el => {
            if (el.id === newMainData.id && !isBuy) {
                setIsBuy(true)
                flag = false
            }
        })
        if (flag) {
            if (isBuy === null) {
                setIsBuy(false)
            }
        }
    }

    if (newMainData.body.isSale === true) {
        if (isBuy === true) {
            buttonColor = '#414BE0FF'
            buttonText = 'Перейти в корзину'
            buttonLink = () => {
                onBasket()
            }
        } else if (isBuy === false) {
            buttonColor = '#51a456'
            buttonText = ('Добавить в корзину')
            buttonLink = () => {
                setIsBuy(null)
                onSendData();
            }
        } else {
            buttonColor = '#51a456'
            buttonText = ('Секунду...')
            buttonLink = () => {
            }
        }
    } else {
        buttonColor = 'gray'
        buttonText = 'Нет в продаже'
        buttonLink = () => {
        }
    }


    let descriptionText = ''
    if (typeof newMainData.body.description === 'undefined') {
        descriptionText = ''
    } else {
        descriptionText = newMainData.body.description
    }

    let genre = ''
    if (typeof newMainData.body.genre === 'undefined') {
        genre = ''
    } else {
        genre = 'Жанр: ' + newMainData.body.genre
    }

    let oldPrice = ''
    let parcent = ''
    if (typeof newMainData.body.oldPrice === 'undefined') {
        oldPrice = ''
    } else {
        oldPrice = newMainData.body.oldPrice.toLocaleString() + ' ₽'
        parcent = '−' + Math.ceil((1 - newMainData.body.price / newMainData.body.oldPrice) * 100) + '%'
    }

    let endDate = ''
    if (typeof newMainData.body.endDate === 'undefined') {
        endDate = ''
    } else {
        endDate = 'Скидка ' + parcent + ' ' + newMainData.body.endDate
    }

    let language = ''
    if (typeof newMainData.body.language === 'undefined') {
        language = ''
    } else {
        if (typeof newMainData.body.languageSelector !== 'undefined') {
            language = 'Язык в игре: ' + newMainData.body.languageSelector
        } else {
            language = 'Язык в игре: ' + newMainData.body.language
        }
    }

    let region = ''
    if (typeof newMainData.body.region === 'undefined') {
        region = ''
    } else {
        region = 'Регион активации: ' + newMainData.body.region
    }

    let releaseDate = ''
    if (typeof newMainData.body.releaseDate === 'undefined') {
        releaseDate = ''
    } else {
        releaseDate = 'Дата релиза: ' + newMainData.body.releaseDate.replace('#', '')
    }

    let numPlayers = ''
    if (typeof newMainData.body.numPlayers === 'undefined') {
        numPlayers = ''
    } else {
        numPlayers = 'Количество игроков: ' + newMainData.body.numPlayers
    }

    let platform = ''
    if (typeof newMainData.body.platform === 'undefined') {
        platform = ''
    } else {
        platform = 'Платформа: ' + newMainData.body.platform
    }


    let signElement = (<div></div>)
    useEffect(() => {
        if (textHidden === null) {
            heightText = refText.current.getBoundingClientRect().height;
            if (heightText > 17.3 * 4) {
                setTextHidden(false)
            } else {
                setTextHidden(0)
            }
        }
    }, [refText]);

    if (textHidden !== 0 && textHidden !== null) {
        if (textHidden) {
            signElement = (
                <div className={'background-arrow'}
                     style={{
                         width: '20px',
                         height: '20px',
                         rotate: '-90deg',
                         transitionProperty: 'rotate',
                         transitionDuration: '0.3s'
                     }}/>
            )
            textElementHeight = heightText
        } else {
            signElement = (
                <div className={'background-arrow'}
                     style={{
                         width: '20px',
                         height: '20px',
                         rotate: '90deg',
                         transitionProperty: 'rotate',
                         transitionDuration: '0.3s'
                     }}/>
            )
            textElementHeight = 0
        }
    }
    let seeLove = (<div/>)
    if (dataCards.length !== 0) {
        seeLove = (<div>
            <div className={"title"}>Рекомендуем:</div>
            <div className={'list-grid'}>
                {dataCards.map(item => {
                    return (<ProductItem key={item.id} product={item}/>)
                })}
            </div>
        </div>)
    }
    return (
        <div className={'card-product'}>
            <div style={{
                borderRadius: '10px', marginLeft: '10px',
                marginRight: '10px',
                width: String(window.innerWidth - 20) + 'px',
                marginTop: '10px',
            }}>
                <div className={'img'} style={{
                    height: String(window.innerWidth - 20) + 'px',
                    borderRadius: '15px', backgroundImage: "url('" + newMainData.body.img + "')",
                    backgroundSize: 'cover', display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'end',
                    justifyContent: 'space-between',
                }}/>
                <div style={{
                    color: 'white',
                    background: '#2b2e31',
                    borderRadius: '15px',
                    paddingLeft: '15px',
                    paddingRight: '15px',
                    paddingTop: '5px',
                    paddingBottom: '5px',
                    fontSize: '24px',
                    textAlign: 'left',
                    fontFamily: "'Montserrat', sans-serif",
                    marginTop: '5px',
                }}>{newMainData.body.title}</div>

                <div style={{
                    color: 'white',
                    background: '#2b2e31',
                    borderRadius: '15px',
                    paddingTop: '5px',
                    paddingBottom: '10px',
                    textAlign: 'left',
                    fontFamily: "'Montserrat', sans-serif",
                    marginTop: '5px',
                    marginBottom: '7px'
                }}>

                    <div style={{
                        marginTop: '5px',
                        fontSize: '14px',
                        color: 'white',
                        fontFamily: "'Montserrat', sans-serif",
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'end',
                        marginLeft: '15px'
                    }}>
                        <div style={{
                            fontSize: '26px',
                            color: '#50a355',
                            fontWeight: '800'
                        }}>{newMainData.body.price.toLocaleString() + ' ₽'}</div>
                        <div style={{
                            textDecoration: 'line-through',
                            color: '#969696',
                            marginLeft: '15px',
                            fontSize: '22px',
                            fontWeight: '700'
                        }}>{oldPrice}</div>
                    </div>
                    <div style={{
                        fontSize: '18px',
                        marginTop: '5px',
                        color: '#969696',
                        fontFamily: "'Montserrat', sans-serif",
                        display: 'flex',
                        flexDirection: 'row',
                        marginLeft: '15px',
                        paddingBottom: '10px'
                    }}>
                        {endDate}
                    </div>

                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>

                        <button className={'all-see-button'} onClick={buttonLink}
                                style={{
                                    background: buttonColor,
                                    borderRadius: '12px',
                                    width: String(window.innerWidth - 75) + 'px',
                                    transitionProperty: 'background',
                                    transitionDuration: '0.2s',
                                    marginLeft: '5px',
                                    marginTop: '0px'
                                }}>{buttonText}
                        </button>
                        <div style={{
                            height: '40px',
                            width: '40px',
                            background: '#969696',
                            borderRadius: '12px',
                            padding: '7.5px',
                            marginRight:'5px'
                        }}>
                            <div className={'background-whiteHeart'} style={{height: '25px', width: '25px'}}></div>
                        </div>
                    </div>
                    <div style={{marginLeft: '15px', fontWeight: '600'}}>

                        <div style={{
                            marginTop: '12px',
                            fontSize: '14px',
                            color: 'white',
                            fontFamily: "'Montserrat', sans-serif"
                        }}>{releaseDate}
                        </div>
                        <div style={{
                            marginTop: '12px',
                            fontSize: '14px',
                            color: 'white',
                            fontFamily: "'Montserrat', sans-serif"
                        }}>{platform}
                        </div>

                        <div style={{
                            marginTop: '12px',
                            fontSize: '14px',
                            color: 'white',
                            fontFamily: "'Montserrat', sans-serif"
                        }}>
                            {numPlayers}
                        </div>


                        <div style={{
                            marginTop: '12px',
                            fontSize: '14px',
                            color: 'white',
                            fontFamily: "'Montserrat', sans-serif"
                        }}>
                            {language}
                        </div>

                        <div style={{
                            marginTop: '12px',
                            fontSize: '14px',
                            color: 'white',
                            fontFamily: "'Montserrat', sans-serif"
                        }}>
                            {region}
                        </div>

                        <div style={{
                            marginTop: '12px',
                            fontSize: '14px',
                            color: 'white',
                            fontFamily: "'Montserrat', sans-serif"
                        }}>
                            {genre}
                        </div>

                    </div>
                </div>
                <div style={{
                    color: 'white',
                    background: '#2b2e31',
                    borderRadius: '15px',
                    paddingRight: '15px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    textAlign: 'left',
                    fontFamily: "'Montserrat', sans-serif",
                    marginTop: '5px',
                    marginBottom: '7px',
                }} onClick={() => {
                    if (textHidden === true) {
                        setTextHidden(false)
                    } else if (textHidden === false) {
                        setTextHidden(true)
                    }

                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginLeft: '15px',
                        height: '20px',
                        alignItems: 'center'
                    }}>
                        <div style={{fontWeight: '600', marginLeft: '0px', fontSize: '14px', lineHeight: '17px'}}
                             className={'text-element'}>
                            Описание игры
                        </div>
                        <div>{signElement}</div>
                    </div>
                    <div>
                        <div style={{
                            marginLeft: '15px',
                            lineHeight: '19px',
                            height: String(textElementHeight) + 'px',
                            fontSize: '16px',
                            overflow: 'hidden',
                            color: 'white',
                            fontFamily: "'Montserrat', sans-serif",
                            transitionProperty: 'height',
                            transitionDuration: '0.3s',
                        }}>
                            <div ref={refText}>{descriptionText}</div>
                        </div>
                    </div>
                </div>
            </div>
            {seeLove}
        </div>
    );
};

export default CardProduct;