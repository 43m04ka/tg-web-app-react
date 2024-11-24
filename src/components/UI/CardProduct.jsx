import React, {useCallback, useEffect} from 'react';
import Button from "./Button";
import {useTelegram} from "../../hooks/useTelegram";

const CardProduct = ({mainData, path}) => {
    const itemData = mainData.mainData
    const {tg} = useTelegram();


    const onBack = useCallback(() => {
        window.location.href='/home'+path;
    }, [])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])

    console.log(itemData)
    return (
        <div>
            <span>{'Page '+itemData.title}</span>
        </div>
    );
};

export default CardProduct;