import React, {useEffect, useState} from 'react';
import style from '../Product.module.scss'
import {useTelegram} from "../../../../../hooks/useTelegram";
import useGlobalData from "../../../../../hooks/useGlobalData";
import {useServerUser} from "../../../../../hooks/useServerUser";

const ProductBasketCounter = ({idPos, setCardInBasket}) => {

    const {user} = useTelegram();

    const {pageId, basket, catalogList, updateBasket} = useGlobalData()
    const {setBasketPositionCount, deleteCardToBasket} = useServerUser()

    let productData = {}

    basket.map(el => {
        if (el.id === idPos) {
            productData = el
        }
    })

    const [product, setProduct] = useState(productData);
    const [counter, setCounter] = React.useState(productData.count || 1);

    useEffect(() => {
        basket.map(el => {
            if (el.id === idPos) {
                setProduct(el)
                setCounter(el.count)
            }
        })
    }, [idPos])

    useEffect(() => {
        if (product.count !== counter) {
            setBasketPositionCount(() => {
                updateBasket(catalogList, pageId)
            }, user.id, idPos, counter).then()
        }
    }, [counter])

    return (<div className={style['productBasketCounter']}>
        <div onClick={async () => {
            if (counter - 1 <= 0) {
                setCardInBasket(false)
                await deleteCardToBasket(() => {
                    updateBasket(catalogList, pageId)
                }, user.id, idPos)
            } else {
                setCounter(counter - 1)
            }
        }}>
            <p>-</p>
        </div>
        <p>{counter} шт.</p>
        <div onClick={() => {
            setCounter(counter + 1)
        }}>
            <p>+</p>
        </div>
    </div>);
};

export default ProductBasketCounter;