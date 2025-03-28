import {useCallback, useEffect, useRef, useState} from 'react';
import '../styles/cube.css';
import {useNavigate} from "react-router-dom";
import {useTelegram} from "../../hooks/useTelegram";

let gameArray = []
let gameVin = -1

const Roulette = () => {

    const [scrollValue, setScrollValue] = useState(1150);
    const [status, setStatus] = useState(0);
    const [sizeValue, setSizeValue] = useState(100);

    const ref = useRef();
    const {tg} = useTelegram();

    const navigate = useNavigate()

    let b = ['https://image.api.playstation.com/vulcan/ap/rnd/202404/1913/1cf37c0ac3bae6b582f64e7c4c3f28d0ace851383de64552.png?w=230',
        'https://image.api.playstation.com/vulcan/img/rnd/202112/0804/2UTMvRFqn4SdaoxhtQnxchcn.png?w=230',
        'https://image.api.playstation.com/vulcan/ap/rnd/202402/2219/ec6ee0fb9c9419a77e360f50d5597ea1759e15254f289199.png?w=230',
        'https://image.api.playstation.com/vulcan/ap/rnd/202302/1518/ceee9b156d56a1d5db66bda68a03ce6f038a40b11617e9d7.png?w=230',
        'https://image.api.playstation.com/vulcan/ap/rnd/202406/2414/9b1539efc317cc39ff5a46d379fac78cb86fcc7673e588dd.png?w=230',
        'https://image.api.playstation.com/vulcan/ap/rnd/202402/0507/8c2432fe4cd0d8a0e74d55cdb22eb66196c3b8368a4ac0bd.png?w=230',
        'https://image.api.playstation.com/vulcan/ap/rnd/202202/2811/x9SuHZAiRn0uJXB1IKteIgcw.png?w=230']

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    let onBack = useCallback(async () => {
        navigate('/basket0');
    }, [])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])


    if (gameArray.length === 0) {
        let a = new Array(180);
        for (let i = 0; i < a.length; i++) {
            let ren = getRandomInt(b.length)
            if (ren === a[i - 1]) {
                if (ren + 1 < b.length) {
                    a[i] = ren + 1
                } else {
                    a[i] = getRandomInt(ren)
                }
            } else {
                a[i] = ren
            }
        }
        console.log(a)
        if (gameVin === -1) {
            let ren = getRandomInt(b.length)
            gameVin = b[ren]
            a[161] = ren
        }
        gameArray = a
    }

    let textElement = (<div className={'text-element'} style={{
        marginTop: '-55px',
        marginLeft: String(window.innerWidth / 2 - 90) + 'px',
        marginRight: '15px',
        height: '36px',
        fontSize: '30px',
        lineHeight: '35px',
        fontVariant: 'small-caps',
        paddingTop: '8px',
        position: 'fixed',
    }}>
        кубик рулетка
    </div>)

    if (status === 2) {
        textElement = (<div className={'text-element'} style={{
            marginTop: '-100px',
            width: String(window.innerWidth) + 'px',
            marginRight: '15px',
            height: '100px',
            fontSize: '33px',
            lineHeight: '36px',
            textAlign: 'center',
            fontVariant: 'small-caps',
            paddingTop: '8px',
            position: 'fixed',
        }}>
            <div style={{
                height: '45px',
                fontSize: '33px',
                lineHeight: '36px',
                textAlign: 'center',
                fontVariant: 'small-caps',
            }}>
                вы выйграли
            </div>
            <div className={'text-element'} style={{
                marginTop: '-10px',
                height: '36px',
                fontSize: '20px',
                lineHeight: '28px',
                fontVariant: 'small-caps',
                paddingTop: '8px',
                textAlign: 'center',
            }}>
                "ПЕФ лыоaskjhkasdhвылвоа"
            </div>
        </div>)
    }

    let buttonElement = (<div className={'text-element'} style={{
        background: '#759d44',
        marginTop: '10px',
        marginLeft: '15px',
        marginRight: '15px',
        borderRadius: '50px',
        height: '36px',
        fontSize: '16px',
        textAlign: 'center',
        lineHeight: '16px',
        fontVariant: 'small-caps',
        paddingTop: '8px',
    }} onClick={() => {
        setScrollValue(1150 + 110 * 150)
        setStatus(1)
        setTimeout(() => {
            setStatus(2)
            setSizeValue(150)
        }, 11000)
    }}>крутить
    </div>)

    if (status === 2) {
        buttonElement = (<div className={'text-element'} style={{
            background: '#759d44',
            marginTop: '10px',
            marginLeft: '15px',
            marginRight: '15px',
            borderRadius: '50px',
            height: '36px',
            fontSize: '14px',
            textAlign: 'center',
            lineHeight: '18px',
            paddingTop: '8px'
        }} onClick={() => {
            navigate('/basket0')
        }}>Оформить заказ
        </div>)
    }

    return (
        <div>
            {textElement}

            <div style={{
                height: String(sizeValue) + 'px',
                width: String(sizeValue) + 'px',
                marginLeft: String(-sizeValue / 2 + 50 + window.innerWidth / 2 - 50) + 'px',
                marginTop: String(-sizeValue / 2 + 50 + 30) + 'px',
                zIndex: String(sizeValue - 125),
                transitionDuration: '0.3s',
                transitionProperty: 'height, width, margin-left, margin-top',
                background: 'url("' + gameVin + '")',
                backgroundSize: 'cover',
                marginRight: '10px',
                borderRadius: '15px',
                position: 'absolute'
            }}></div>
            <div style={{
                background: 'linear-gradient(to right, rgba(0, 0, 0, 0.6) 0%, rgba(69, 69, 69, 0) 20%), linear-gradient(to left, rgba(0, 0, 0, 0.6) 0%, rgba(69, 69, 69, 0) 20%)',
                borderRadius: '17.5px',
                marginLeft: '15px',
                zIndex: 25,
                width: String(window.innerWidth - 30) + 'px',
                height: '160px',
                position: 'absolute',
            }}/>
            <div style={{
                background: '#454545',
                borderRadius: '17.5px',
                marginLeft: '15px',
                marginRight: '15px',
                paddingTop: '30px',
                paddingBottom: '30px',
                zIndex: 0,
                marginTop: String(window.innerHeight / 2 - 125) + 'px'
            }}>
                <div style={{
                    width: '0',
                    height: '0',
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderTop: '20px solid #c1c3cc',
                    transitionDuration: '0.3s',
                    transitionProperty: 'margin-top',
                    position: 'absolute',
                    zIndex: 200,
                    marginLeft: String((window.innerWidth - 30) / 2 - 5) + 'px',
                    marginTop: String(-sizeValue / 2 + 50 - 10) + 'px',
                }}/>

                <div style={{
                    width: '0',
                    height: '0',
                    rotate: '180deg',
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderTop: '20px solid #c1c3cc',
                    transitionDuration: '0.3s',
                    transitionProperty: 'margin-top',
                    position: 'absolute',
                    zIndex: 200,
                    marginLeft: String((window.innerWidth - 30) / 2 - 5) + 'px',
                    marginTop: String(100 + (sizeValue - 100) / 2 - 10) + 'px',
                }}/>
                <div style={{overflow: 'hidden', width: String(window.innerWidth - 30) + 'px'}}>
                    <div ref={ref} style={{
                        display: "flex",
                        transition: 'transform 10s ease-out',
                        flexDirection: 'row',
                        width: '200000px',
                        transform: 'translateX(' + String((window.innerWidth - 30) / 2 - scrollValue - 110) + 'px)',
                    }}>
                        {gameArray.map(element => {

                            if (element === 6) {
                                let style = {
                                    height: String(sizeValue) + 'px',
                                    width: String(sizeValue) + 'px',
                                    transitionProperty: 'height, width',
                                    transitionDuration: '0.4s',
                                    background: 'url("' + b[element] + '")',
                                    backgroundSize: 'cover',
                                    marginRight: '10px',
                                    borderRadius: '7px',
                                }
                                return (
                                    <div style={{
                                        height: '100px',
                                        width: '100px',
                                        marginRight: '10px',
                                        borderRadius: '7px',
                                        background: 'url("' + b[element] + '")',
                                        backgroundSize: 'cover'
                                    }}>
                                    </div>
                                )
                            } else {
                                let style = {
                                    height: '100px',
                                    width: '100px',
                                    background: 'url("' + b[element] + '")',
                                    backgroundSize: 'cover',
                                    marginRight: '10px',
                                    borderRadius: '7px'
                                }
                                return (
                                    <div style={style}/>
                                )
                            }


                        })}
                    </div>
                </div>
            </div>
            {buttonElement}
        </div>
    );
};

export default Roulette;