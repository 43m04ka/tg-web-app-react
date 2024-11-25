import React, {useCallback, useEffect} from 'react';
import Button from "./Button";
import {useTelegram} from "../../hooks/useTelegram";
import {useNavigate, useParams} from "react-router-dom";

const CardProduct = ({mainData, path}) => {
    const {tg} = useTelegram();
    const navigate = useNavigate();

    const onBack = useCallback(async () => {
        navigate(-1);
    }, [])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])

    console.log(mainData)
    return (
        <div className={'card-product'}>
            <img src={mainData.img} className={'img'} alt="Product Image"/>
            <span>{'Page ' + mainData.title}</span>
        </div>
    );
};

export default CardProduct;