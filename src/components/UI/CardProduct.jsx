import React, {createRef, useCallback, useEffect} from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import {useNavigate, useParams} from "react-router-dom";

let oldTExtHeight = 0
const CardProduct = ({mainData, basketData}) => {
    let newMainData = mainData.body
    newMainData.id = mainData.id
    mainData = newMainData
    console.log(newMainData)
    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    const [isBuy, setIsBuy] = React.useState(false);
    let inputTextButton = 'Добавить в корзину'
    if(mainData.isSale===false){inputTextButton = 'Нет в продаже';}
    const [buttonText, setButtonText] = React.useState(inputTextButton);
    const [textHeight, setTextHeight] = React.useState(null);
    const [textHidden, setTextHidden] = React.useState(2);
    const [signElement, setSignElement] = React.useState();
    const refText = createRef();

    basketData.map(el=>{
        if(el.id===mainData.id && !isBuy){
            setButtonText('Перейти в корзину')
            setIsBuy(true)
        }
    })



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
        navigate('/basket'+mainData.tab);
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
                if (result) {
                    setIsBuy(true)
                    setButtonText('Перейти в корзину')
                } else {
                    setButtonText('Добавить в корзину')
                }
            })
        })
    }, [sendData])

    let buttonColor = '#51a456'
    let buttonLink = () => {
        onSendData();
        setButtonText('Ожидайте...');
    }
    if (isBuy) {
        buttonColor = '#414BE0FF'
        buttonLink = () => {
            onBasket()
        }
    }
    if (mainData.isSale === false) {
        buttonColor = '#gray'
        buttonLink = () => {}
    }

    let descriptionText = ''
    if (typeof mainData.description === 'undefined') {
        descriptionText = ''
    } else {
        descriptionText = 'Описание: ' + mainData.description
    }

    let genre = ''
    if (typeof mainData.genre === 'undefined') {
        genre = ''
    } else {
        genre = 'Жанр: ' + mainData.genre
    }

    let oldPrice = ''
    let parcent = ''
    if (typeof mainData.oldPrice === 'undefined') {
        oldPrice = ''
    } else {
        oldPrice = String(mainData.oldPrice) + ' ₽'
        parcent = '−'+String(Math.ceil((1-mainData.price/mainData.oldPrice)*100))+'%'
    }
    let parcentEl = (<div></div>)
    if(parcent !== ''){
        parcentEl = (<div style={{
            lineHeight: '20px',
            background: '#ff5d5d',
            paddingLeft: '3px',
            paddingRight: '3px',
            borderRadius: '5px',
            marginBottom: '5px',
            textDecoration: 'none',
            textAlign: 'left',
            marginLeft: '5px',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            overflow: 'hidden',
            color: 'white',
            width: 'max-content'
        }}>{parcent}</div>)
    }

    let endDate = ''
    if (typeof mainData.endDate === 'undefined') {
        endDate = ''
    } else {
        endDate = 'Скидка до ' + mainData.endDate
    }

    let language = ''
    if (typeof mainData.language === 'undefined') {
        language = ''
    } else {
        if(typeof mainData.languageSelector !== 'undefined'){
            language = mainData.languageSelector
        }else {
            language = 'Язык в игре: ' + mainData.language
        }
    }

    let region = ''
    if (typeof mainData.region === 'undefined') {
        region = ''
    } else {
        region = 'Регион активации: ' + mainData.region
    }

    useEffect(() => {
        const height = refText.current.getBoundingClientRect().height;
        if (textHidden === 2) {
            oldTExtHeight = height
            if (height > 17.3 * 6) {
                setTextHeight(17.3 * 6)
                setTextHidden(true)
                setSignElement(
                    <div className={'background-arrow'}
                         style={{
                             width: '20px',
                             height: '20px',
                             rotate: '90deg',
                             transitionProperty: 'rotate',
                             transitionDuration: '0.3s'
                         }}/>)
            } else {
                setTextHeight(height)
            }
        }
    }, [refText, setTextHeight]);

    const onResize = () => {
        if(textHidden !== 2){
        if (textHidden) {
            setSignElement(
                <div className={'background-arrow'}
                     style={{
                         width: '20px',
                         height: '20px',
                         rotate: '-90deg',
                         transitionProperty: 'rotate',
                         transitionDuration: '0.3s'
                     }}/>
            )
            setTextHeight(oldTExtHeight)
            setTextHidden(false)
        } else {
            setSignElement(
                <div className={'background-arrow'}
                     style={{
                         width: '20px',
                         height: '20px',
                         rotate: '90deg',
                         transitionProperty: 'rotate',
                         transitionDuration: '0.3s'
                     }}/>
            )
            setTextHeight(17.3 * 6)
            setTextHidden(true)
        }
    }}

    return (
        <div className={'card-product'}>
            <div style={{
                borderRadius: '10px', marginLeft: '10px',
                marginRight: '10px',
                width: String(window.innerWidth - 20) + 'px',
                marginTop: '10px',
                paddingBottom: '5px',
            }}>
                <div className={'img'} style={{
                    height: String(window.innerWidth - 20) + 'px',
                    borderRadius: '10px', backgroundImage:"url('"+mainData.img+"')",
                    backgroundSize: 'cover',     display:'flex',
                    flexDirection:'row',
                    alignItems:'end',
                    justifyContent: 'space-between',
                }}>{parcentEl}</div>
                <div style={{
                    color: 'white',
                    fontSize: '22px',
                    textAlign: 'center',
                    fontFamily: "'Montserrat', sans-serif",
                    marginTop: '7px',
                    marginBottom: '7px'
                }}>{mainData.title}</div>

                <div style={{marginLeft: '15px'}}>

                    <div style={{
                        marginTop: '7px',
                        fontSize: '14px',
                        color: 'white',
                        fontFamily: "'Montserrat', sans-serif",
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <div style={{fontSize: '20px'}}>{mainData.price + ' ₽'}</div>
                        <div style={{
                            textDecoration: 'line-through',
                            color: 'gray',
                            marginLeft: '25px',
                            fontSize: '20px'
                        }}>{oldPrice}</div>
                        <div style={{
                            fontSize: '14px',
                            color: '#ff5d5d',
                            fontFamily: "'Montserrat', sans-serif",
                            display: 'flex',
                            flexDirection: 'row',
                            marginLeft: '15px',
                        }}>
                            {endDate}
                        </div>
                    </div>

                    <div onClick={onResize}>
                        <div style={{
                            marginTop: '12px',
                            lineHeight: '17.3px',
                            height: String(textHeight) + 'px',
                            fontSize: '14px',
                            overflow: 'hidden',
                            color: 'white',
                            fontFamily: "'Montserrat', sans-serif",
                            transitionProperty: 'height',
                            transitionDuration: '0.3s'
                        }} ref={refText}>{descriptionText}
                        </div>
                        <div style={{
                            justifyItems: 'center'
                        }}>{signElement}</div>
                    </div>
                    <div style={{
                        marginTop: '12px',
                        fontSize: '14px',
                        color: 'white',
                        fontFamily: "'Montserrat', sans-serif"
                    }}>{'Платформа: ' + mainData.platform}
                    </div>


                    <div style={{
                        marginTop: '12px',
                        fontSize: '14px',
                        color: 'white',
                        fontFamily: "'Montserrat', sans-serif"
                    }}>
                        {language}
                    </div>

                    <div style={{
                        marginTop: '12px',
                        fontSize: '14px',
                        color: 'white',
                        fontFamily: "'Montserrat', sans-serif"
                    }}>
                        {region}
                    </div>

                    <div style={{
                        marginTop: '12px',
                        fontSize: '14px',
                        color: 'white',
                        fontFamily: "'Montserrat', sans-serif"
                    }}>
                        {genre}
                    </div>

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