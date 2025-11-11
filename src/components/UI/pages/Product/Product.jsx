import React, {useEffect, useState} from 'react';
import {useTelegram} from "../../../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";
import {useServerUser} from "../../../../hooks/useServerUser";
import useGlobalData from "../../../../hooks/useGlobalData";
import Recommendations from "./Recommendations";
import style from './Product.module.scss'

const Product = () => {

    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    const {getCard, addCardToFavorite, deleteCardToFavorite, addCardToBasket} = useServerUser()
    const {
        updatePreviewFavoriteData, previewFavoriteData, pageId, pageList, basket, updateCounterBasket
    } = useGlobalData()

    let cardId = Number((window.location.pathname).replace('/card/', ''))

    const [productData, setProductData] = useState(null);
    let flag = false
    basket.map(pos => {
        if (pos.id === cardId) {
            flag = true;
        }
    })
    const [cardInBasket, setCardInBasket] = useState(flag)
    const [cardInFavorite, setCardInFavorite] = useState(previewFavoriteData.includes(cardId))

    if (productData !== null && cardId !== productData.id) {
        setProductData(null)
        let flag = false
        basket.map(pos => {
            if (pos.id === cardId) {
                flag = true;
            }
        })
        setCardInBasket(flag)
        setCardInFavorite(previewFavoriteData.includes(cardId))
    }

    useEffect(() => {
        tg.BackButton.show();
        tg.onEvent('backButtonClicked', () => navigate(-1))
        return () => {
            tg.offEvent('backButtonClicked', () => navigate(-1))
        }

    }, [])


    if (productData !== null) {

        let oldPrice = ''
        let price = productData.price.toLocaleString() + ' ₽'

        let endDatePromotion = ''
        if (productData.endDatePromotion !== null) {
            endDatePromotion = `cкидка ${Math.ceil((1 - productData.price / productData.oldPrice) * 100)}% (${productData.oldPrice - productData.price}₽) действует ${productData.endDatePromotion}`
        }
        if (productData.oldPrice !== null) {
            oldPrice = productData.oldPrice.toLocaleString() + ' ₽'
        } else if (productData.similarCard !== null) {
            price = productData.similarCard?.price.toLocaleString() + ' ₽'
            if (typeof productData.similarCard.oldPrice !== 'undefined') {
                oldPrice = productData.similarCard?.oldPrice.toLocaleString() + ' ₽'
            }
            if (typeof productData.similarCard.endDatePromotion !== 'undefined') {
                endDatePromotion = `cкидка ${Math.ceil((1 - productData.similarCard?.price / productData.similarCard?.oldPrice) * 100)}% (${productData.similarCard?.oldPrice - productData.similarCard?.price}₽) действует ${productData.similarCard?.endDatePromotion}`
            }
        }


        return (<div className={style['mainDivision']}>

            <div>
                <div>
                    <img src={productData.image.slice(0, productData.image.indexOf('?w=') + 1) + "w=1024"}></img>
                </div>
                <div>{productData.name}</div>
                <div>
                    <div style={{color: oldPrice !== '' ? '#489a4e' : 'white'}}>Стоимость — {price}</div>
                    <div>{oldPrice}</div>
                </div>
                <div>
                    {endDatePromotion}
                </div>
                <div>
                    <div onClick={() => {
                        cardInBasket ? navigate('/' + pageList.map(page => {
                            return pageId === page.id ? page.link : null
                        }).filter(page => page !== null)[0] + '/basket') : addCardToBasket(() => {
                            setCardInBasket(true)
                        }, user.id, cardId)
                    }}
                         style={{background: productData.onSale ? cardInBasket ? '#0d3ad0' : '#489a4e' : '#585c59'}}>
                        {productData.onSale ? cardInBasket ? 'Перейти в корзину' : 'В корзину' : 'Нет в продаже'}
                    </div>
                    <div>
                        <div>
                            <div/>
                        </div>
                    </div>
                </div>
            </div>
            <Recommendations/>
        </div>);
    } else {
        getCard(setProductData, cardId)
    }
};

export default Product;

//
// let language = ''
// if (typeof productData.language === 'undefined' || productData.language === null) {
//     language = ''
// } else {
//     if (typeof productData.languageSelector !== 'undefined' || productData.languageSelector === null) {
//         language = 'Язык в игре: ' + productData.languageSelector
//         language = (<div style={{
//             marginTop: '12px',
//             fontSize: '14px',
//             color: 'white',
//             fontFamily: "'Montserrat', sans-serif"
//         }}>{language}
//         </div>)
//     } else {
//         language = 'Язык в игре: ' + productData.language
//         language = (<div style={{
//             marginTop: '12px',
//             fontSize: '14px',
//             color: 'white',
//             fontFamily: "'Montserrat', sans-serif"
//         }}>{language}
//         </div>)
//     }
// }
//
// let region = ''
// if (productData.regionActivate !== null) {
//     region = (<div style={{
//         marginTop: '12px',
//         fontSize: '14px',
//         color: 'white',
//         fontFamily: "'Montserrat', sans-serif"
//     }}>{'Регион активации: ' + productData.regionActivate}
//     </div>)
// }
//
// let releaseDate = ''
// if (typeof productData.releaseDate === 'undefined' || productData.releaseDate === null) {
//     releaseDate = ''
// } else {
//     let a = (new Date(productData.releaseDate)) * 24 * 60 * 60 * 1000
//     let currentDate = new Date('1899-12-30T00:00:00.000Z')
//     let newDate = new Date(a + currentDate.getTime());
//
//     releaseDate = 'Дата релиза: ' + newDate.toLocaleDateString('ru-RU')
//     releaseDate = (<div style={{
//         marginTop: '12px',
//         fontSize: '14px',
//         color: 'white',
//         fontFamily: "'Montserrat', sans-serif"
//     }}>{releaseDate}
//     </div>)
// }
//
// let numberPlayers = ''
// if (productData.numberPlayers !== null) {
//     numberPlayers = 'Количество игроков: ' + productData.numberPlayers
//     numberPlayers = (<div style={{
//         marginTop: '12px',
//         fontSize: '14px',
//         color: 'white',
//         fontFamily: "'Montserrat', sans-serif"
//     }}>{numberPlayers}
//     </div>)
// }
//
// let platform = ''
// if (typeof productData.platform === 'undefined' || productData.platform === null) {
//     platform = ''
// } else {
//     platform = 'Платформа: ' + productData.platform
//     platform = (<div style={{
//         marginTop: '12px',
//         fontSize: '14px',
//         color: 'white',
//         fontFamily: "'Montserrat', sans-serif"
//     }}>{platform}
//     </div>)
// }
//
// let view = ''
// if (productData.choiceRow !== null) {
//     view = (<div style={{
//         marginTop: '12px',
//         fontSize: '14px',
//         color: 'white',
//         fontFamily: "'Montserrat', sans-serif"
//     }}>{'Срок подписки: ' + productData.choiceRow}
//     </div>)
// }
//
// let imgElement = (<div style={{
//     height: String(window.innerWidth - 20 - ((window.innerWidth - 20) / 2 - 50)) + 'px'
// }}>
//     <div className={'plup-loader'} style={{
//         opacity: 0.3,
//         marginTop: String((window.innerWidth - 20) / 2 - 50) + 'px',
//         marginLeft: String((window.innerWidth - 20) / 2 - 50) + 'px',
//         position: 'unset'
//     }}></div>
// </div>)
// let imgLoadElem = (<></>)
// if (pictureIsLoad === 1) {
//     imgElement = (<div className={'img'} style={{
//         height: String(window.innerWidth - 20) + 'px',
//         borderRadius: '15px', backgroundImage: "url('" + productData.image + "')",
//         backgroundSize: 'cover', display: 'flex',
//         flexDirection: 'row',
//         alignItems: 'end',
//         justifyContent: 'space-between',
//     }}></div>)
//     imgLoadElem = (<img className={'img'} style={{
//         height: String(0) + 'px',
//         borderRadius: '15px', //backgroundImage: "url('" + productData.image + "0')",
//         backgroundSize: 'cover', display: 'flex',
//         flexDirection: 'row',
//         alignItems: 'end',
//         justifyContent: 'space-between',
//     }} src={productData.image.slice(0, productData.image.indexOf('?w=') + 1) + 'w=1024'}
//                         onLoad={() => setPictureIsLoad(2)}></img>)
// }
// if (pictureIsLoad === 2) {
//     imgElement = (<div className={'img'} style={{
//         height: String(window.innerWidth - 20) + 'px',
//         borderRadius: '15px',
//         backgroundImage: "url('" + productData.image.slice(0, productData.image.indexOf('?w=') + 1) + "w=1024')",
//         backgroundSize: 'cover',
//         display: 'flex',
//         flexDirection: 'row',
//         alignItems: 'end',
//         justifyContent: 'space-between',
//     }}></div>)
// }

// let genre = ''
// if (typeof productData.genre === 'undefined' || productData.genre === null) {
//     genre = ''
// } else {
//     genre = 'Жанр: ' + productData.genre
//     genre = (<div style={{
//         marginTop: '12px',
//         fontSize: '14px',
//         color: 'white',
//         fontFamily: "'Montserrat', sans-serif"
//     }}>{genre}
//     </div>)
// }