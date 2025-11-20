import React, {useEffect, useState} from 'react';
import {useTelegram} from "../../../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";
import {useServerUser} from "../../../../hooks/useServerUser";
import useGlobalData from "../../../../hooks/useGlobalData";
import Recommendations from "./Recommendations";
import style from './Product.module.scss'
import Description from "./Description";

const parameters = [{label: 'Платформа', key: 'platform'}, {
    label: 'Регион активации',
    key: 'regionActivate'
}, {label: 'Язык в игре', key: 'language'}, {label: 'Количество игроков', key: 'numberPlayers'},]

const Product = () => {

    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    const {getCard, addCardToFavorite, deleteCardToFavorite, addCardToBasket} = useServerUser()
    const {
        updatePreviewFavoriteData, previewFavoriteData, pageId, pageList, basket
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
            endDatePromotion = `*cкидка действует ${productData.endDatePromotion}`
        }
        if (productData.oldPrice !== null) {
            oldPrice = productData.oldPrice.toLocaleString() + ' ₽'
        } else if (productData.similarCard !== null) {
            price = productData.similarCard?.price.toLocaleString() + ' ₽'
            if (typeof productData.similarCard.oldPrice !== 'undefined') {
                oldPrice = productData.similarCard?.oldPrice.toLocaleString() + ' ₽'
            }
            if (typeof productData.similarCard.endDatePromotion !== 'undefined') {
                endDatePromotion = `*cкидка действует ${productData.similarCard?.endDatePromotion}`
            }
        }

        return (<div className={style['container']} style={{
            paddingTop: String(tg?.contentSafeAreaInset.top + tg?.safeAreaInset.top) + 'px',
            paddingBottom: String(tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom + 0.17 * window.innerWidth) + 'px',
            height: '100vh',
        }}>
            <div className={style['productImage']}
                 style={{backgroundImage: 'url(' + productData.image.slice(0, productData.image.indexOf('?w=') + 1) + "w=1024" + ')'}}>
                <button className={style['favorite']} onClick={async () => {
                    if (cardInFavorite) {
                        setCardInFavorite(false)
                        await deleteCardToFavorite(() => {
                            updatePreviewFavoriteData()
                        }, user.id, cardId)
                    } else {
                        setCardInFavorite(true)
                        await addCardToFavorite(() => {
                            updatePreviewFavoriteData()
                        }, user.id, cardId)
                    }
                }}>
                    <div/>
                    <div
                        style={{scale: (cardInFavorite ? '1' : '0.5'), opacity: (cardInFavorite ? '1' : '0')}}/>
                </button>
            </div>

            <div className={style['priceNameBlock']}>
                <p className={style['title']}>{productData.name}</p>
                <div className={style['price']}>
                    <div style={{borderColor: oldPrice !== '' ? '#D86147' : '#171717'}}>{price}</div>
                </div>
                {endDatePromotion !== '' ? (<div className={style['endDatePromotion']}>
                    {endDatePromotion}
                </div>) : ''}
                <div className={style['parameters']}>
                    {parameters.map((parameter, index) => {
                        if (productData[parameter.key] !== null && productData[parameter.key] !== '') {
                            return (<div key={index}>
                                    <div>{parameter.label}:</div>
                                    <div>{productData[parameter.key]}</div>
                                </div>)
                        }
                    })}
                </div>
            </div>

            <Description>{productData.description}</Description>

            <Recommendations/>

            <div className={style['basketButton']} style={{paddingBottom: String(tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom) + 'px'}}>
                <button onClick={() => {
                    cardInBasket ? navigate('/' + pageList.map(page => {
                        return pageId === page.id ? page.link : null
                    }).filter(page => page !== null)[0] + '/basket') : addCardToBasket(() => {
                        setCardInBasket(true)
                    }, user.id, cardId)
                }}
                        style={{background: productData.onSale ? cardInBasket ? '#50A355' : '#404ADE' : '#585c59'}}>
                    {productData.onSale ? cardInBasket ? 'В корзине / перейти в корзину' : 'Добавить в корзину' : 'Нет в продаже'}
                </button>
            </div>
        </div>);
    } else {
        getCard(setProductData, cardId).then()
    }
};

export default Product;