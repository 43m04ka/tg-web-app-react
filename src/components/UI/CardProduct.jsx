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
        if(flag){
            if(isBuy) {
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
        }else if (isBuy === false){
            buttonColor = '#51a456'
            buttonText = ('Добавить в корзину')
            buttonLink = () => {
                setIsBuy(null)
                onSendData();
            }
        }else{
            buttonColor = '#51a456'
            buttonText = ('Секунду...')
            buttonLink = () => {
            }
        }
    }else{
        buttonColor = 'gray'
        buttonText = 'Нет в продаже'
        buttonLink = () => {}
    }




    let descriptionText = ''
    if (typeof newMainData.body.description === 'undefined') {
        descriptionText = ''
    } else {
        descriptionText = 'Описание: ' + newMainData.body.description
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
        oldPrice = String(newMainData.body.oldPrice) + ' ₽'
        parcent = '−' + String(Math.ceil((1 - newMainData.body.price / newMainData.body.oldPrice) * 100)) + '%'
    }
    let parcentEl = (<div></div>)
    if (parcent !== '') {
        parcentEl = (<div style={{
            lineHeight: '20px',
            background: '#ff5d5d',
            paddingLeft: '3px',
            paddingRight: '3px',
            borderRadius: '5px',
            marginBottom: '5px',
            textDecoration: 'none',
            textAlign: 'left',
            marginLeft: '5px',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            overflow: 'hidden',
            color: 'white',
            width: 'max-content'
        }}>{parcent}</div>)
    }

    let endDate = ''
    if (typeof newMainData.body.endDate === 'undefined') {
        endDate = ''
    } else {
        endDate = 'Скидка ' + newMainData.body.endDate
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
        if(textHidden === null) {
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
            textElementHeight = 17.3 * 3
        }
    }
    let seeLove = (<div/>)
    if (dataCards.length !== 0) {
        seeLove = (<div>
            <div className={"title"}>Может понравиться</div>
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
                paddingBottom: '5px',
            }}>
                <div className={'img'} style={{
                    height: String(window.innerWidth - 20) + 'px',
                    borderRadius: '10px', backgroundImage: "url('" + newMainData.body.img + "')",
                    backgroundSize: 'cover', display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'end',
                    justifyContent: 'space-between',
                }}>{parcentEl}</div>
                <div style={{
                    color: 'white',
                    fontSize: '22px',
                    textAlign: 'center',
                    fontFamily: "'Montserrat', sans-serif",
                    marginTop: '7px',
                    marginBottom: '7px'
                }}>{newMainData.body.title}</div>

                <div style={{marginLeft: '15px'}}>

                    <div style={{
                        marginTop: '7px',
                        fontSize: '14px',
                        color: 'white',
                        fontFamily: "'Montserrat', sans-serif",
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <div style={{fontSize: '20px'}}>{newMainData.body.price + ' ₽'}</div>
                        <div style={{
                            textDecoration: 'line-through',
                            color: 'gray',
                            marginLeft: '25px',
                            fontSize: '20px'
                        }}>{oldPrice}</div>
                        <div style={{
                            fontSize: '14px',
                            color: '#ff5d5d',
                            fontFamily: "'Montserrat', sans-serif",
                            display: 'flex',
                            flexDirection: 'row',
                            marginLeft: '15px',
                        }}>
                            {endDate}
                        </div>
                    </div>

                    <div onClick={() => {
                        if (textHidden === true) {
                            setTextHidden(false)
                        } else if (textHidden === false) {
                            setTextHidden(true)
                        }

                    }}>
                        <div style={{
                            marginTop: '12px',
                            lineHeight: '17.3px',
                            height: String(textElementHeight) + 'px',
                            fontSize: '14px',
                            overflow: 'hidden',
                            color: 'white',
                            fontFamily: "'Montserrat', sans-serif",
                            transitionProperty: 'height',
                            transitionDuration: '0.3s'
                        }}>
                            <div ref={refText}>{descriptionText}</div>
                        </div>
                        <div style={{
                            justifyItems: 'center'
                        }}>{signElement}</div>
                    </div>
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
                <button className={'all-see-button'} onClick={buttonLink}
                        style={{
                            background: buttonColor,
                            width: String(window.innerWidth - 20 - 8) + 'px',
                            transitionProperty: 'background',
                            transitionDuration: '0.2s',
                        }}>{buttonText}
                </button>
            </div>
            {seeLove}
        </div>
    );
};

export default CardProduct;