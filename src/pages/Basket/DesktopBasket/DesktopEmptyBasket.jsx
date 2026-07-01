import React from "react";
import { useNavigate } from "react-router-dom";
import Recommendations from "../../../shared/ui/Recommendations/Recommendations";
import useGlobalData from "../../../hooks/useGlobalData";
import style from "./DesktopEmptyBasket.module.scss";

const DesktopEmptyBasket = () => {
    const navigate = useNavigate();
    const { bufferCardsRecommendations } = useGlobalData();

    return (
        <div className={style.mainContainer}>
            <div className={style.emptyBasket}>
                <div className={style.duck} />
                <div className={style.label}>В корзине ничего нет</div>
                <button
                    className={style.button}
                    onClick={() => navigate(window.location.pathname.replace("/basket", ""))}
                >
                    Перейти к покупкам
                </button>
            </div>
            <div className={style.content}>
                <Recommendations from={"basket"} desktop data={bufferCardsRecommendations} />
            </div>
        </div>
    );
};

export default DesktopEmptyBasket;
