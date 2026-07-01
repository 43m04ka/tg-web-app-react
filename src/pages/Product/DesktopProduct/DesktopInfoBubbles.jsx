import React, {useState} from 'react';
import StarRating from "../Elements/InfoBubbles/StarRaiting/StarRating";
import {getBubbleItems} from "./productDesktopUtils";
import style from "./DesktopInfoBubbles.module.scss";

const DesktopInfoBubbles = ({productData}) => {
    const [isOpen, setIsOpen] = useState(false);
    const bubbles = getBubbleItems(productData);
    const extraBubbles = productData.bubbles || [];
    const ratingData = productData.starRating;
    const shouldShowRating = ratingData !== null
        && Number(ratingData.averageRating) > 0
        && Number(ratingData.totalRatingsCount) > 0;

    return (
        <section className={style.card}>
            <div className={style.list}>
                {shouldShowRating && (
                    <div className={style.rating}>
                        <StarRating data={ratingData} desktop/>
                    </div>
                )}

                {bubbles.filter((item) => item.label !== null).map((item) => (
                    <div key={item.label} className={style.item}>
                        <span className={style.iconWrap}>
                            <img
                                className={`${style.icon} ${item.invert ? style.iconInvert : ''}`}
                                src={item.icon}
                                alt=""
                            />
                        </span>
                        <p>{item.label}</p>
                    </div>
                ))}

                <div className={style.extraList + ' ' + (isOpen ? style.extraListOpen : '')}>
                    {extraBubbles.map((label) => (
                        <div key={label} className={style.item}>
                            <span className={style.extraIcon}/>
                            <p>{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {extraBubbles.length > 2 && (
                <button className={style.toggle} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? 'Скрыть' : 'Показать все'}
                </button>
            )}
        </section>
    );
};

export default DesktopInfoBubbles;
