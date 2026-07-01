import React from 'react';
import {useServerUser} from "../../../hooks/useServerUser";
import useGlobalData from "../../../hooks/useGlobalData";
import {useTelegram} from "../../../hooks/useTelegram";
import {getInfoLabelArray, getPriceData} from "./productDesktopUtils";
import style from "./DesktopNamePlace.module.scss";

const DesktopNamePlace = ({productData, cardInFavorite, setCardInFavorite}) => {
    const {addCardToFavorite, deleteCardToFavorite} = useServerUser();
    const {updatePreviewFavoriteData} = useGlobalData();
    const {user} = useTelegram();
    const labels = getInfoLabelArray(productData).join(' • ');
    const {price} = getPriceData(productData);

    const toggleFavorite = async () => {
        setCardInFavorite(!cardInFavorite);

        if (cardInFavorite) {
            await deleteCardToFavorite(updatePreviewFavoriteData, user.id, productData.id);
            return;
        }

        await addCardToFavorite(updatePreviewFavoriteData, user.id, productData.id);
    };

    return (
        <section className={style.card}>
            <div className={style.header}>
                <div className={style.image} style={{backgroundImage: `url("${productData.image}")`}}/>

                <div className={style.meta}>
                    <div className={style.topRow}>
                        <h1 className={style.title}>{productData.name}</h1>
                        <button className={style.favorite} onClick={toggleFavorite}>
                            <div/>
                            <div style={{scale: cardInFavorite ? '1' : '0.5', opacity: cardInFavorite ? '1' : '0'}}/>
                        </button>
                    </div>
                </div>
            </div>

            <p className={style.info}>{labels}</p>
            <div className={style.priceRow}>
                <span className={style.price}>{price.toLocaleString('ru-RU')} ₽</span>
            </div>
        </section>
    );
};

export default DesktopNamePlace;
