import React from 'react';
import style from "./DesktopBackgroundImage.module.scss";
import {getPriceData, shouldRenderLogo} from "./productDesktopUtils";

const DesktopBackgroundImage = ({productData}) => {
    const {price, oldPrice, label, logoUrl, imageUrl, promoDate, isPreOrder} = getPriceData(productData);
    const showLogo = shouldRenderLogo(productData);

    return (
        <section className={style.card}>
            <div className={style.image} style={{backgroundImage: `url("${imageUrl}")`}}>
                {showLogo && <img className={style.logo} src={logoUrl} alt={productData.name}/>}

                <div className={style.priceBox}>
                    <div className={style.priceRow}>
                        <span className={style.price}>{price.toLocaleString()} ₽</span>
                        {oldPrice && <span className={style.oldPrice}>{oldPrice.toLocaleString()} ₽</span>}
                    </div>

                    {label && (
                        <p className={style.saleLabel}>
                            {isPreOrder ? 'предзаказ' : 'скидка'} {label} {promoDate}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default DesktopBackgroundImage;
