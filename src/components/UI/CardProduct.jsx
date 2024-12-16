import React, {useCallback, useEffect} from 'react';
import Button from "./Button";
import {useTelegram} from "../../hooks/useTelegram";
import {useNavigate, useParams} from "react-router-dom";

const CardProduct = ({mainData}) => {
    const {tg, user} = useTelegram();
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

    const sendData = {
        method:'add',
        mainData: mainData,
        user: {id: 5106439090, first_name: "tёma"},
    }

    const onSendData = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/basket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendData)
        }).then(r => console.log(r))
    }, [sendData])

    return (
        <div className={'card-product'}>
            <div className={'img_wrap'}>
                <img src={mainData.img} className={'img'} alt="Product Image"/>
            </div>
            <div className={'text-element name-card-element'}>{mainData.title}</div>
            <button onClick={onSendData} className={'all-see-button'}>Добавить в корзину</button>
        </div>
    );
};

export default CardProduct;