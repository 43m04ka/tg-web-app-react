import React, {useCallback, useEffect} from 'react';
import Button from "./Button";
import {useTelegram} from "../../hooks/useTelegram";

const CardProduct = ({mainData, path}) => {
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

    console.log(mainData)
    return (
        <div>
            <span>{'Page '+mainData.title}</span>
        </div>
    );
};

export default CardProduct;