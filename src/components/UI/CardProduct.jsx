    import React, {createRef, Suspense, useCallback, useEffect, useState} from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import {Link, useNavigate, useParams} from "react-router-dom";
import ProductItem from "./ProductItem";
import { LazyLoadImage } from "react-lazy-load-image-component";


let heightText = null
let textElementHeight = null
const CardProduct = () => {

    let basketData = []
    let favoriteData = []

    const {tg} = useTelegram();
    const refText = createRef();
    const navigate = useNavigate();

    const [isBuy, setIsBuy] = React.useState(null);
    const [textHidden, setTextHidden] = React.useState(true);
    const [dataCards, setDataCards] = React.useState([]);
    const [isFavorite, setIsFavorite] = React.useState(false);
    const [pictureIsLoad, setPictureIsLoad] =  useState(0);


    useEffect(() => {
        tg.BackButton.show();
        tg.onEvent('backButtonClicked', () => navigate(-1))
        return () => {
            tg.offEvent('backButtonClicked', () => navigate(-1))
        }

    }, [])

    const onBasket = useCallback(async () => {
        navigate('/basket' + newMainData.body.tab);
    }, [])

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

    let flag1 = true
    favoriteData.map(el => {
        if (el.id === newMainData.id && !isFavorite) {
            setIsFavorite(true)
            flag1 = false
        }
    })
    if (flag1) {
        if (isFavorite === null) {
            setIsFavorite(false)
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

    let backgroundColor = '#696969'
    if (isFavorite) {
        backgroundColor = '#ff5d5d'
    }


    let descriptionText = ''
    if (typeof newMainData.body.description === 'undefined') {
        descriptionText = ''
    } else {
        descriptionText = newMainData.body.description
    }

    let genre = ''
    if (typeof newMainData.body.genre === 'undefined' || newMainData.body.genre === 'NA') {
        genre = ''
    } else {
        genre = 'Жанр: ' + newMainData.body.genre
        genre = (<div style={{
            marginTop: '12px',
            fontSize: '14px',
            color: 'white',
            fontFamily: "'Montserrat', sans-serif"
        }}>{genre}
        </div>)
    }

    let oldPrice = ''
    let parcent = ''
    if (typeof newMainData.body.oldPrice === 'undefined' || newMainData.body.oldPrice === 'NA') {
        oldPrice = ''
    } else {
        oldPrice = newMainData.body.oldPrice.toLocaleString() + ' ₽'
        parcent = '−' + Math.ceil((1 - newMainData.body.price / newMainData.body.oldPrice) * 100) + '%'
    }

    let endDate = ''
    if (typeof newMainData.body.endDate === 'undefined' || newMainData.body.endDate === 'NA') {
        endDate = ''
    } else {
        endDate = 'Скидка ' + parcent + ' ' + newMainData.body.endDate
    }

    let language = ''
    if (typeof newMainData.body.language === 'undefined' || newMainData.body.language === 'NA') {
        language = ''
    } else {
        if (typeof newMainData.body.languageSelector !== 'undefined' || newMainData.body.languageSelector === 'NA') {
            language = 'Язык в игре: ' + newMainData.body.languageSelector
            language = (<div style={{
                marginTop: '12px',
                fontSize: '14px',
                color: 'white',
                fontFamily: "'Montserrat', sans-serif"
            }}>{language}
            </div>)
        } else {
            language = 'Язык в игре: ' + newMainData.body.language
            language = (<div style={{
                marginTop: '12px',
                fontSize: '14px',
                color: 'white',
                fontFamily: "'Montserrat', sans-serif"
            }}>{language}
            </div>)
        }
    }

    let region = ''
    if (typeof newMainData.body.region === 'undefined' || newMainData.body.region === 'NA') {
        region = ''
    } else {
        region = 'Регион активации: ' + newMainData.body.region
        region = (<div style={{
            marginTop: '12px',
            fontSize: '14px',
            color: 'white',
            fontFamily: "'Montserrat', sans-serif"
        }}>{region}
        </div>)

    }

    let releaseDate = ''
    if (typeof newMainData.body.releaseDate === 'undefined' || newMainData.body.releaseDate === 'NA') {
        releaseDate = ''
    } else {
        releaseDate = 'Дата релиза: ' + newMainData.body.releaseDate.replace('#', '')
        releaseDate = (<div style={{
            marginTop: '12px',
            fontSize: '14px',
            color: 'white',
            fontFamily: "'Montserrat', sans-serif"
        }}>{releaseDate}
        </div>)
    }

    let numPlayers = ''
    if (typeof newMainData.body.numPlayers === 'undefined' || newMainData.body.numPlayers === 'NA') {
        numPlayers = ''
    } else {
        numPlayers = 'Количество игроков: ' + newMainData.body.numPlayers
        numPlayers = (<div style={{
            marginTop: '12px',
            fontSize: '14px',
            color: 'white',
            fontFamily: "'Montserrat', sans-serif"
        }}>{numPlayers}
        </div>)
    }

    let platform = ''
    if (typeof newMainData.body.platform === 'undefined' || newMainData.body.platform === 'NA') {
        platform = ''
    } else {
        platform = 'Платформа: ' + newMainData.body.platform
        platform = (<div style={{
            marginTop: '12px',
            fontSize: '14px',
            color: 'white',
            fontFamily: "'Montserrat', sans-serif"
        }}>{platform}
        </div>)
    }

    let view = ''
    if (typeof newMainData.body.view === 'undefined' || newMainData.body.view === 'NA') {
        view = ''
    } else {
        view = 'Срок подписки: ' + newMainData.body.view
        view = (<div style={{
            marginTop: '12px',
            fontSize: '14px',
            color: 'white',
            fontFamily: "'Montserrat', sans-serif"
        }}>{view}
        </div>)
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
    if (dataCards.length !== 0 && pictureIsLoad >= 1) {
        seeLove = (<div>
            <div className={"title"}>Рекомендуем:</div>
            <div className={'list-grid'}>
                {dataCards.map(item => {
                    return (<div style={{marginLeft: String((window.innerWidth - 150 - 150) / 3) + 'px'}}><ProductItem key={item.id} product={item}/></div>)
                })}
            </div>
        </div>)
    }
    let imgElement = (<div style={{
        height: String(window.innerWidth - 20 - ((window.innerWidth - 20) / 2 - 50)) + 'px'}}>
        <div className={'plup-loader'} style={{
            opacity: 0.3,
            marginTop: String((window.innerWidth - 20) / 2 - 50) + 'px',
            marginLeft: String((window.innerWidth - 20) / 2 - 50) + 'px',
            position:'unset'
    }}></div></div>)
    let imgLoadElem = (<></>)
    if (pictureIsLoad === 1) {
        imgElement = (<div className={'img'} style={{
            height: String(window.innerWidth - 20) + 'px',
            borderRadius: '15px', backgroundImage: "url('" + newMainData.body.img + "')",
            backgroundSize: 'cover', display: 'flex',
            flexDirection: 'row',
            alignItems: 'end',
            justifyContent: 'space-between',
        }}></div>)
        imgLoadElem = (<img className={'img'} style={{
            height: String(0) + 'px',
            borderRadius: '15px', //backgroundImage: "url('" + newMainData.body.img + "0')",
            backgroundSize: 'cover', display: 'flex',
            flexDirection: 'row',
            alignItems: 'end',
            justifyContent: 'space-between',
        }} src={newMainData.body.img.slice(0, newMainData.body.img.indexOf('?w=') + 1) + 'w=1024'}
                            onLoad={() => setPictureIsLoad(2)}></img>)
    }
    if (pictureIsLoad === 2) {
        imgElement = (<div className={'img'} style={{
            height: String(window.innerWidth - 20) + 'px',
            borderRadius: '15px', backgroundImage: "url('" + newMainData.body.img.slice(0, newMainData.body.img.indexOf('?w=')+1) + "w=1024')",
            backgroundSize: 'cover', display: 'flex',
            flexDirection: 'row',
            alignItems: 'end',
            justifyContent: 'space-between',
        }}></div>)
    }


    return (
        <div className={'card-product'}>
            <div style={{
                borderRadius: '10px', marginLeft: '10px',
                marginRight: '10px',
                width: String(window.innerWidth - 20) + 'px',
                marginTop: '10px',
            }}>
                <img className={'img'} style={{
                    height: String(0) + 'px',
                    borderRadius: '15px', //backgroundImage: "url('" + newMainData.body.img + "0')",
                    backgroundSize: 'cover', display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'end',
                    justifyContent: 'space-between',
                }} src={newMainData.body.img}
                     onLoad={() => setPictureIsLoad(1)}></img>
                {imgLoadElem}
                {imgElement}
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
                            background: backgroundColor,
                            borderRadius: '12px',
                            padding: '7.5px',
                            marginRight: '5px',
                            transitionProperty: 'background',
                            transitionDuration: '0.2s',
                        }} onClick={() => {
                            if (isFavorite) {
                                sendDataF.method = 'del'
                                onSendDataF()
                            } else {
                                sendDataF.method = 'add'
                                onSendDataF()
                            }
                        }}>
                            <div className={'background-whiteHeart'} style={{height: '25px', width: '25px'}}></div>
                        </div>
                    </div>
                    <div style={{marginLeft: '15px', fontWeight: '600'}}>
                        {releaseDate}
                        {platform}
                        {numPlayers}
                        {view}
                        {language}
                        {region}
                        {genre}
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