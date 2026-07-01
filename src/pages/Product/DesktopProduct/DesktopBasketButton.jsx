import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {useTelegram} from "../../../hooks/useTelegram";
import useGlobalData from "../../../hooks/useGlobalData";
import {useServerUser} from "../../../hooks/useServerUser";
import style from "./DesktopBasketButton.module.scss";

const DesktopBasketButton = ({productData, cardInBasket, setCardInBasket}) => {
    const navigate = useNavigate();
    const {user} = useTelegram();
    const {addCardToBasket, setBasketPositionCount, deleteCardToBasket} = useServerUser();
    const {
        pageId,
        pageList,
        basket,
        catalogList,
        updateBasket,
        addCardToBasketList,
        removeCardFromBasketList,
        updateCardCountInBasketList,
    } = useGlobalData();

    const currentItem = basket.find((item) => item.id === productData.id);
    const [count, setCount] = useState(currentItem?.count || 1);

    useEffect(() => {
        setCount(currentItem?.count || 1);
    }, [currentItem?.count]);

    const openBasket = () => {
        const params = new URLSearchParams(window.location.search);
        const from = params.get('from');
        const pageLink = pageList.find((page) => page.id === pageId)?.link;
        navigate(`/${pageLink}${from !== 'basket' ? '/basket?from=product' : '/basket'}`);
    };

    const handleMainClick = async () => {
        if (!productData.onSale) return;
        if (cardInBasket) return openBasket();

        setTimeout(() => setCardInBasket(true), 50);
        addCardToBasketList(productData);
        await addCardToBasket(() => updateBasket(catalogList, pageId), user.id, productData.id);
    };

    const updateCount = async (nextCount) => {
        if (nextCount <= 0) {
            setCardInBasket(false);
            removeCardFromBasketList(productData.id);
            await deleteCardToBasket(() => updateBasket(catalogList, pageId), user.id, productData.id);
            return;
        }

        setCount(nextCount);
        updateCardCountInBasketList(productData.id, nextCount);
        await setBasketPositionCount(() => updateBasket(catalogList, pageId), user.id, productData.id, nextCount);
    };

    return (
        <section className={style.card}>
            <button
                className={`${style.button} ${!productData.onSale ? style.disabled : cardInBasket ? style.inBasket : style.onSale}`}
                onClick={handleMainClick}
            >
                {productData.onSale ? (cardInBasket ? 'В корзине' : 'Добавить в корзину') : 'Нет в продаже'}
            </button>

            {productData.onSale && cardInBasket && (
                <div className={style.counter}>
                    <button onClick={() => updateCount(count - 1)}>-</button>
                    <span>{count} шт.</span>
                    <button onClick={() => updateCount(count + 1)}>+</button>
                </div>
            )}
        </section>
    );
};

export default DesktopBasketButton;
