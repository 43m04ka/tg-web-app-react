import React, {useCallback, useEffect} from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import {useNavigate, useParams} from "react-router-dom";

const CardProduct = ({mainData}) => {
    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    const [isBuy, setIsBuy] = React.useState(false);
    const [buttonText, setButtonText] = React.useState('Добавить в корзину');

    const onBack = useCallback(async () => {
        navigate(-1);
    }, [])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])

    const onBasket = useCallback(async () => {
        navigate('/home/basket');
    }, [])

    useEffect(() => {
        tg.BackButton.show();
    }, [])

    const sendData = {
        method: 'add',
        mainData: mainData,
        user: user,
    }

    const onSendData = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/basket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendData)
        }).then(r => {
            let Promise = r.json()
            Promise.then(prom => {
                const result = prom.body
                if(result) {
                    setIsBuy(true)
                    setButtonText('Перейти в корзину')
                }else{setButtonText('Добавить в корзину')}
            })
        })
    }, [sendData])

    let buttonColor = '#51a456'
    let buttonLink = () => {onSendData();setButtonText('Ожидайте...');}
    if(isBuy) {
        buttonColor = '#414BE0FF'
        buttonLink = () => {onBasket()}
    }

    let descriptionText = ''
    if(typeof mainData.description === 'undefined') {
         descriptionText = ''
    }else{
         descriptionText = 'Описание: '+mainData.description
    }

    return (
        <div className={'card-product'}>
            <div style={{
                background: '#454545', borderRadius: '10px', marginLeft: '10px',
                marginRight: '10px',
                width: String(window.innerWidth - 20) + 'px',
                marginTop: '10px',
                paddingBottom: '5px'
            }}>
                <img src={mainData.img} className={'img'} style={{
                    height: String(window.innerWidth - 20) + 'px',
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px'
                }}
                     alt="Product Image"/>
                <div style={{
                    color: 'white',
                    fontSize: '22px',
                    textAlign: 'center',
                    fontFamily: "Argentum Sans VF Arial",
                    marginTop: '7px',
                    marginBottom: '7px'
                }}>{mainData.title}</div>
                <div style={{
                    marginTop: '7px',
                    fontSize: '14px',
                    color: 'white',
                    fontFamily: "Argentum Sans VF Arial"
                }}>{descriptionText}
                </div>
                <div style={{
                    marginTop: '7px',
                    fontSize: '14px',
                    color: 'white',
                    fontFamily: "Argentum Sans VF Arial"
                }}>{'Платформа: ' + mainData.platform}
                </div>
                <button className={'all-see-button'} onClick={buttonLink}
                        style={{
                            background: buttonColor,
                            width: String(window.innerWidth - 20 - 8) + 'px',
                            transitionProperty: 'background',
                            transitionDuration: '0.2s',
                        }}>{buttonText}
                </button>
            </div>
        </div>
    );
};

export default CardProduct;