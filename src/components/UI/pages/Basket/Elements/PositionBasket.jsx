import React, {useState} from 'react';
import style from './PositionBasket.module.scss';
import {useServer} from "../useServer";
import {useTelegram} from "../../../../../hooks/useTelegram";
import useGlobalData from "../../../../../hooks/useGlobalData";
import {useNavigate} from "react-router-dom";

const PositionBasket = ({product, page, percent}) => {
    const item = product;

    const {addCardToFavorite, deleteCardToFavorite, deleteCardToBasket} = useServer()
    const {tg, user} = useTelegram();
    const {updatePreviewFavoriteData, previewFavoriteData, pageId, catalogList, updateBasket} = useGlobalData()
    const navigate = useNavigate()

    const [counter, setCounter] = useState(1);
    const [cardInFavorite, setCardInFavorite] = useState(previewFavoriteData.includes(product.id))

    let oldPrice = ''
    let type = 0
    let price = item.price*counter


    if (item.oldPrice !== null) {
        type = 1
        oldPrice = item.oldPrice*counter
    } else if (item.similarCard !== null) {
        type = 0
        price = item.similarCard?.price*counter
        if (typeof item.similarCard.oldPrice !== 'undefined' && typeof item.similarCard.oldPrice !== 'undefined') {
            type = 1
            oldPrice = item.similarCard?.oldPrice*counter
        }
    }

    if(percent > 0){
        type = 1
        oldPrice = price
        price = price - price*percent/100
    }

    return (<div className={style['container']}>
        <div onClick={() => {
            navigate('/card/' + product.id)
        }}>
            <div className={style['positionImage']} style={{backgroundImage: "url('" + item.image + "')"}}/>
            <div className={style['infoPlace']}>
                <p>{item.name + (item.choiceRow !== null ? ' • ' + item.choiceRow : '')}</p>
                <p>{'для ' + item.platform || ''}</p>
            </div>

        </div>
        <div>
            <div className={style['buttonPlace']}>
                <div className={style['favorite']}
                     onClick={async () => {
                         if (cardInFavorite) {
                             setCardInFavorite(false)
                             await deleteCardToFavorite(() => {
                                 updatePreviewFavoriteData()
                             }, user.id, product.id)
                         } else {
                             setCardInFavorite(true)
                             await addCardToFavorite(() => {
                                 updatePreviewFavoriteData()
                             }, user.id, product.id)
                         }
                     }}>
                    <div>
                        <div style={{scale: (cardInFavorite ? '1' : '0.5'), opacity: (cardInFavorite ? '1' : '0')}}/>
                    </div>
                </div>
                <div onClick={async () => {
                    await deleteCardToBasket(() => {
                        updateBasket(catalogList, pageId)
                    }, user.id, product.id)
                }}>
                    <div className={style['trash']}/>
                </div>
                <div className={style['productBasketCounter']}>
                    <div onClick={async () => {
                        if (counter - 1 <= 0) {
                            await deleteCardToBasket(() => {
                                updateBasket(catalogList, pageId)
                            }, user.id, product.id)
                        } else {
                            setCounter(counter - 1)
                        }
                    }}>
                        <p>-</p>
                    </div>
                    <p>{counter}</p>
                    <div onClick={() => {
                        setCounter(counter + 1)
                    }}>
                        <p>+</p>
                    </div>
                </div>

            </div>
            <div className={style['pricePlace']}>
                <p className={style['priceOld']}>{oldPrice !== '' ? (oldPrice).toLocaleString() + ' ₽' : ''}</p>
                <p className={style[type === 0 ? 'priceDefault' : 'priceDiscount']}>{(price).toLocaleString() + ' ₽'}</p>
            </div>
        </div>
    </div>);
};

export default PositionBasket;