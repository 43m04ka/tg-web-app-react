import React, {createRef, useEffect, useState} from 'react';
import {useTelegram} from "../../../../hooks/useTelegram";
import {Link, useNavigate} from "react-router-dom";
import ProductItem from "../../ProductItem";
import {useServerUser} from "../../../../hooks/useServerUser";
import useGlobalData from "../../../../hooks/useGlobalData";
import Description from "./Description";
import Recommendations from "./Recommendations";


let heightText = null
let textElementHeight = null
const Product = () => {

    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    const {getCard, addCardToFavorite, deleteCardToFavorite, addCardToBasket} = useServerUser()
    const {updatePreviewFavoriteData, previewFavoriteData, updatePreviewBasketData, previewBasketData, pageId, catalogList, updateCounterBasket} = useGlobalData()

    let cardId = Number((window.location.pathname).replace('/card/', ''))

    const [isBuy, setIsBuy] = React.useState(null);
    const [productData, setProductData] = React.useState(null);
    console.log(productData)
    const [isFavorite, setIsFavorite] = React.useState(false);
    const [pictureIsLoad, setPictureIsLoad] =  useState(0);

    if(productData !== null && cardId !== productData.id){
        setProductData(null)
        setPictureIsLoad(0)
    }

    useEffect(() => {
        tg.BackButton.show();
        tg.onEvent('backButtonClicked', () => navigate(-1))
        return () => {
            tg.offEvent('backButtonClicked', () => navigate(-1))
        }

    }, [])


    if(productData !== null) {
        let buttonColor
        let buttonText
        let buttonLink

        if(isFavorite !== previewFavoriteData.includes(cardId)) {
            setIsFavorite(previewFavoriteData.includes(cardId))
        }

        if(isBuy !== previewBasketData.includes(cardId) && productData.onSale) {
            setIsBuy(previewBasketData.includes(cardId))
        }

        if (productData.onSale === true) {
            if (isBuy === true) {
                buttonColor = '#414BE0FF'
                buttonText = 'Перейти в корзину'
                buttonLink = () => {
                    navigate('/basket-' + pageId);
                }
            } else if (isBuy === false) {
                buttonColor = '#51a456'
                buttonText = ('Добавить в корзину')
                buttonLink = async () => {
                    await setIsBuy(null)
                    await addCardToBasket(()=> {updatePreviewBasketData(user.id);updateCounterBasket(catalogList, pageId)}, user.id, cardId).then()
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

        let genre = ''
        if (typeof productData.genre === 'undefined' || productData.genre === null) {
            genre = ''
        } else {
            genre = 'Жанр: ' + productData.genre
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
        let price = productData.price.toLocaleString() + ' ₽'

        if (productData.oldPrice !== null) {
            oldPrice = productData.oldPrice.toLocaleString() + ' ₽'
            parcent = '−' + Math.ceil((1 - productData.price / productData.oldPrice) * 100) + '%'
        } else if(productData.similarCard !== null){
            price = productData.similarCard?.price.toLocaleString() + ' ₽'
            oldPrice = productData.similarCard?.oldPrice.toLocaleString() + ' ₽'
            parcent = '−' + Math.ceil((1 - productData.similarCard?.price / productData.similarCard?.oldPrice) * 100) + '%'
        }

        let endDatePromotion = ''
        if (productData.endDatePromotion !== null) {
            endDatePromotion = 'Скидка ' + parcent + ' ' + productData.endDatePromotion
        } else if(productData.similarCard !== null){
            endDatePromotion = 'Скидка ' + parcent + ' ' + productData.similarCard.endDatePromotion
        }

        let language = ''
        if (typeof productData.language === 'undefined' || productData.language === null) {
            language = ''
        } else {
            if (typeof productData.languageSelector !== 'undefined' || productData.languageSelector === null) {
                language = 'Язык в игре: ' + productData.languageSelector
                language = (<div style={{
                    marginTop: '12px',
                    fontSize: '14px',
                    color: 'white',
                    fontFamily: "'Montserrat', sans-serif"
                }}>{language}
                </div>)
            } else {
                language = 'Язык в игре: ' + productData.language
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
        if (productData.regionActivate !== null){
            region = (<div style={{
                marginTop: '12px',
                fontSize: '14px',
                color: 'white',
                fontFamily: "'Montserrat', sans-serif"
            }}>{'Регион активации: ' + productData.regionActivate}
            </div>)
        }

        let releaseDate = ''
        if (typeof productData.releaseDate === 'undefined' || productData.releaseDate === null) {
            releaseDate = ''
        } else {
            let a = (new Date(productData.releaseDate))*24*60*60*1000
            let currentDate = new Date('1899-12-30T00:00:00.000Z')
            let newDate = new Date(a + currentDate.getTime());

            releaseDate = 'Дата релиза: ' + newDate.toLocaleDateString('ru-RU')
            releaseDate = (<div style={{
                marginTop: '12px',
                fontSize: '14px',
                color: 'white',
                fontFamily: "'Montserrat', sans-serif"
            }}>{releaseDate}
            </div>)
        }

        let numberPlayers = ''
        if (productData.numberPlayers !== null) {
            numberPlayers = 'Количество игроков: ' + productData.numberPlayers
            numberPlayers = (<div style={{
                marginTop: '12px',
                fontSize: '14px',
                color: 'white',
                fontFamily: "'Montserrat', sans-serif"
            }}>{numberPlayers}
            </div>)
        }

        let platform = ''
        if (typeof productData.platform === 'undefined' || productData.platform === null) {
            platform = ''
        } else {
            platform = 'Платформа: ' + productData.platform
            platform = (<div style={{
                marginTop: '12px',
                fontSize: '14px',
                color: 'white',
                fontFamily: "'Montserrat', sans-serif"
            }}>{platform}
            </div>)
        }

        let view = ''
        if (productData.choiceRow !== null) {
            view = (<div style={{
                marginTop: '12px',
                fontSize: '14px',
                color: 'white',
                fontFamily: "'Montserrat', sans-serif"
            }}>{'Срок подписки: ' + productData.choiceRow}
            </div>)
        }

        let imgElement = (<div style={{
            height: String(window.innerWidth - 20 - ((window.innerWidth - 20) / 2 - 50)) + 'px'
        }}>
            <div className={'plup-loader'} style={{
                opacity: 0.3,
                marginTop: String((window.innerWidth - 20) / 2 - 50) + 'px',
                marginLeft: String((window.innerWidth - 20) / 2 - 50) + 'px',
                position: 'unset'
            }}></div>
        </div>)
        let imgLoadElem = (<></>)
        if (pictureIsLoad === 1) {
            imgElement = (<div className={'img'} style={{
                height: String(window.innerWidth - 20) + 'px',
                borderRadius: '15px', backgroundImage: "url('" + productData.image + "')",
                backgroundSize: 'cover', display: 'flex',
                flexDirection: 'row',
                alignItems: 'end',
                justifyContent: 'space-between',
            }}></div>)
            imgLoadElem = (<img className={'img'} style={{
                height: String(0) + 'px',
                borderRadius: '15px', //backgroundImage: "url('" + productData.image + "0')",
                backgroundSize: 'cover', display: 'flex',
                flexDirection: 'row',
                alignItems: 'end',
                justifyContent: 'space-between',
            }} src={productData.image.slice(0, productData.image.indexOf('?w=') + 1) + 'w=1024'}
                                onLoad={() => setPictureIsLoad(2)}></img>)
        }
        if (pictureIsLoad === 2) {
            imgElement = (<div className={'img'} style={{
                height: String(window.innerWidth - 20) + 'px',
                borderRadius: '15px',
                backgroundImage: "url('" + productData.image.slice(0, productData.image.indexOf('?w=') + 1) + "w=1024')",
                backgroundSize: 'cover',
                display: 'flex',
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
                        borderRadius: '15px', //backgroundImage: "url('" + productData.image + "0')",
                        backgroundSize: 'cover', display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'end',
                        justifyContent: 'space-between',
                    }} src={productData.image}
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
                    }}>{productData.name}</div>

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
                            }}>{price}</div>
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
                            {endDatePromotion}
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
                                    deleteCardToFavorite(()=>{updatePreviewFavoriteData(user.id)}, user.id, cardId).then()
                                } else {
                                    addCardToFavorite(()=>{updatePreviewFavoriteData(user.id)}, user.id, cardId).then()
                                }
                            }}>
                                <div className={'background-whiteHeart'} style={{height: '25px', width: '25px'}}></div>
                            </div>
                        </div>
                        {productData.additionalParameter !== null && productData.additionalParameter.includes('Save') && productData.additionalParameter.includes('ps-plus') ? <Link to={'/catalog/ps_psplus'}><div className={'background-ps-plus-save'} style={{display: 'flex', marginLeft:'7px', marginTop:'7px', flexDirection: 'row', justifyContent: 'space-between', borderRadius:'10px', width:String(window.innerWidth-34)+'px', height:String((window.innerWidth-34)*0.17142)+'px'}}/></Link> : ''}
                        {productData.additionalParameter !== null && productData.additionalParameter.includes('Extra') ? <Link to={'/catalog/ps_psplus'}><div className={'background-ps-plus-extra'} style={{display: 'flex', marginLeft:'7px', marginTop:'7px', flexDirection: 'row', justifyContent: 'space-between', borderRadius:'10px', width:String(window.innerWidth-34)+'px', height:String((window.innerWidth-34)*0.17142)+'px'}}/></Link> : ''}
                        {productData.additionalParameter !== null && productData.additionalParameter.includes('Deluxe') ? <Link to={'/catalog/ps_psplus'}><div className={'background-ps-plus-deluxe'} style={{display: 'flex', marginLeft:'7px', marginTop:'7px', flexDirection: 'row', justifyContent: 'space-between', borderRadius:'10px', width:String(window.innerWidth-34)+'px', height:String((window.innerWidth-34)*0.17142)+'px'}}/></Link> : ''}
                        {productData.additionalParameter !== null && productData.additionalParameter.includes('Included') ? <Link to={'/catalog/ps_eaplay'}><div className={'background-ea-play-free'} style={{display: 'flex', marginLeft:'7px', marginTop:'7px', flexDirection: 'row', justifyContent: 'space-between', borderRadius:'10px', width:String(window.innerWidth-34)+'px', height:String((window.innerWidth-34)*0.17142)+'px'}}/></Link> : ''}
                        {productData.additionalParameter !== null && productData.additionalParameter.includes('GamePass') ? <Link to={'/catalog/xbox_sub'}><div className={'background-game-pass-free'} style={{display: 'flex', marginLeft:'7px', marginTop:'7px', flexDirection: 'row', justifyContent: 'space-between', borderRadius:'10px', width:String(window.innerWidth-34)+'px', height:String((window.innerWidth-34)*0.17142)+'px'}}/></Link> : ''}
                        <div style={{marginLeft: '15px', fontWeight: '600'}}>
                            {releaseDate}
                            {platform}
                            {numberPlayers}
                            {view}
                            {language}
                            {region}
                            {genre}
                        </div>
                    </div>
                    <Description>{productData.description}</Description>
                </div>
                <Recommendations/>
            </div>
        );
    }else{
        getCard(setProductData, cardId)
    }
};

export default Product;