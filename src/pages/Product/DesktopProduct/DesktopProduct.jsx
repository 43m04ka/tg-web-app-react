import React from 'react';
import {useNavigate} from "react-router-dom";
import Recommendations from "../../../shared/ui/Recommendations/Recommendations";
import DesktopBackgroundImage from "./DesktopBackgroundImage";
import DesktopNamePlace from "./DesktopNamePlace";
import DesktopInfoBubbles from "./DesktopInfoBubbles";
import DesktopChoiceElement from "./DesktopChoiceElement";
import DesktopBasketButton from "./DesktopBasketButton";
import DesktopDescriptionText from "./DesktopDescriptionText";
import DesktopDescriptionImages from "./DesktopDescriptionImages";
import DesktopDescription from "./DesktopDescription";
import DesktopSimilarProducts from "./DesktopSimilarProducts";
import DesktopShareLabels from "./DesktopShareLabels";
import {getSalePromotion} from "./productDesktopUtils";
import style from "./DesktopProduct.module.scss";

const DesktopProduct = ({
    productData,
    selectCardList,
    selectGroup,
    selectPosition,
    setSelectGroup,
    setSelectPosition,
    cardInBasket,
    setCardInBasket,
    cardInFavorite,
    setCardInFavorite,
    parameters,
}) => {
    const navigate = useNavigate();
    const salePromotion = getSalePromotion(productData);
    const isXbox = productData.name.toLowerCase().includes('gpu');

    return (
        <div className={style.page}>
            <div className={style.content}>
                <div className={style.columns}>
                    <div className={style.leftColumn}>
                        <DesktopBackgroundImage productData={productData}/>
                        <DesktopDescriptionImages data={productData.descriptionImages}/>
                        {productData.description && <DesktopDescriptionText productData={productData}/>}
                        <DesktopDescription productData={productData} parameters={parameters}/>
                        <DesktopShareLabels productData={productData} parameters={parameters}/>
                    </div>

                    <div className={style.rightColumn}>
                        <DesktopNamePlace
                            productData={productData}
                            cardInFavorite={cardInFavorite}
                            setCardInFavorite={setCardInFavorite}
                        />
                        <DesktopInfoBubbles productData={productData}/>

                        {selectCardList !== null && selectCardList.length > 1 && (
                            <DesktopChoiceElement
                                list={selectCardList}
                                parameter="name"
                                index={selectGroup}
                                isXbox={isXbox}
                                set={(index) => {
                                    setSelectGroup(index);
                                    setSelectPosition(0);
                                }}
                            />
                        )}

                        {selectCardList !== null && (
                            <DesktopChoiceElement
                                list={selectCardList[selectGroup]?.body || []}
                                parameter="choiceRow"
                                parentIndex={selectGroup}
                                index={selectPosition}
                                isXbox={isXbox}
                                set={setSelectPosition}
                            />
                        )}

                        <DesktopBasketButton
                            productData={productData}
                            cardInBasket={cardInBasket}
                            setCardInBasket={setCardInBasket}
                        />

                        {salePromotion && (
                            <button className={style.salePromotion} onClick={() => navigate(salePromotion.route)}>
                                {salePromotion.label}
                            </button>
                        )}
                    </div>
                </div>

                <DesktopSimilarProducts
                    minRating={productData.name.replace(/[^a-zA-Z0-9\s]/g, "").split(' ')[0].length}
                    productData={productData}
                />
                <Recommendations desktop/>
            </div>
        </div>
    );
};

export default DesktopProduct;
