import React, {useEffect, useState} from 'react';
import style from './PositionBasket.module.scss';
import useGlobalData from "../../../hooks/useGlobalData";
import {useNavigate} from "react-router-dom";
import {useServerUser} from "../../../hooks/useServerUser";
import {usePlatformUser} from "../../../hooks/usePlatformUser";

const PositionBasket = ({product, percent, otherCurrency}) => {
    const {addCardToFavorite, deleteCardToFavorite, deleteCardToBasket, setBasketPositionCount} = useServerUser();
    const { user } = usePlatformUser();
    const {updatePreviewFavoriteData, previewFavoriteData, pageId, catalogList, updateBasket} = useGlobalData();
    const navigate = useNavigate();

    const [counter, setCounter] = useState(product.count);
    const [cardInFavorite, setCardInFavorite] = useState(previewFavoriteData.includes(product.id));

    const isInr = product.priceInOtherCurrency !== null && product.priceInOtherCurrency !== undefined && otherCurrency;

    useEffect(() => {
        if (product.count !== counter) {
            setBasketPositionCount(() => {
                updateBasket(catalogList, pageId)
            }, user.id, product.id, counter).then()
        }
    }, [counter])

    let oldPrice = ''
    let type = 0
    let price = product.price * product.count

    if (product.oldPrice !== null) {
        type = 1
        oldPrice = product.oldPrice * product.count
    }

    if (percent > 0) {
        type = 1
        oldPrice = price
        price = price - price * percent / 100
    }

    if(isInr){
        oldPrice = ''
        type = 0
        price = Number(product.priceInOtherCurrency)
    }

    const currencySign = isInr ? ' Rs' : ' ₽';

    return (<div className={style['container']}>
        <div onClick={() => {
            navigate('/card/' + product.id)
        }}>
            <div className={style['positionImage']} style={{backgroundImage: "url('" + product.image + "')"}}/>
            <div className={style['infoPlace']}>
                <p>{product.name + (product.choiceRow !== null ? ' • ' + product.choiceRow : '')}</p>
                <p>{'для ' + product.platform || ''}</p>
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
                <p className={style['priceOld']}>{oldPrice !== '' ? (oldPrice).toLocaleString() + currencySign : ''}</p>
                <p className={style[type === 0 ? 'priceDefault' : 'priceDiscount']}>{(price).toLocaleString() + currencySign}</p>
            </div>
        </div>
    </div>);
};

export default PositionBasket;
