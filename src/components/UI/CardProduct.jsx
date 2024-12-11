import React, {useCallback, useEffect} from 'react';
import Button from "./Button";
import {useTelegram} from "../../hooks/useTelegram";
import {useNavigate, useParams} from "react-router-dom";

const CardProduct = ({mainData}) => {
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

    useEffect(() => {
        tg.BackButton.show();
    }, [])


    const onSendData = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/web-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mainData)
        }).then(r => console.log(r))
    }, [mainData])

    return (
        <div className={'card-product'}>
            <img src={mainData.img} className={'img'} alt="Product Image"/>
            <span>{'Page ' + mainData.title}</span>
            <button onClick={onSendData} className={'all-see-button'}>запрос</button>
        </div>
    );
};

export default CardProduct;