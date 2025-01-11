import React, {useCallback, useEffect} from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";

const ProductListSelector = ({main_data}) => {
    const [selectCategory, setSelectCategory] = React.useState(0);
    const [selectView, setSelectView] = React.useState(0);
    const [isImgHidden, setIsImgHidden] = React.useState(true);
    const [isBuy, setIsBuy] = React.useState(false);
    const [buttonText, setButtonText] = React.useState('Добавить в корзину');
    const [scrollLeft, setScrollLeft] = React.useState(0);

    console.log(main_data)
    let dataOld = main_data.body

    dataOld = main_data.body.sort(function (a, b) {
        try {
            if (a.category > b.category) {
                return 1;
            }
            if (a.category < b.category) {
                return -1;
            }
        } catch (e) {
        }
        try {
            if (Number(a.view.split(' ')[0]) > Number(b.view.split(' ')[0])) {
                return 1;
            }
            if (Number(a.view.split(' ')[0]) < Number(b.view.split(' ')[0])) {
                return -1;
            }
        } catch (e) {
        }
    });
    let data = []
    const {tg, user} = useTelegram();
    const navigate = useNavigate();

    let lastName = ''
    let vsArray = []
    let lastId = 0
    dataOld.map(el => {
        if (lastName !== el.category) {
            data = [...data, ...vsArray]
            lastName = el.category
            vsArray = [{}]
            vsArray[0].id = lastId
            vsArray[0].title = el.category
            vsArray[0].body = [el]
            lastId += 1
        } else {
            vsArray[0].body = [...vsArray[0].body, ...[el]]
        }

    })
    data = [...data, ...vsArray]

    const onBack = useCallback(async () => {
        navigate(-1);
    }, [])

    const onBasket = useCallback(async () => {
        navigate('/basket');
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

    let cordCategory = (window.innerWidth - 20 - 2 - 2) / data.length * selectCategory + 1.5
    let cordView = (window.innerWidth - 20 - 2 - 2) / data[selectCategory].body.length * selectView + 1.5

    let url = data[selectCategory].body[selectView].img

    let thisElement = dataOld[(selectCategory) * data[0].body.length + selectView]

    let heightImg = window.innerWidth - 20
    if (isImgHidden) {
        heightImg = heightImg * 0.75
    }

    const resizeImg = () => {
        if (isImgHidden) {
            setIsImgHidden(false)
        } else {
            setIsImgHidden(true)
        }
    }

    const sendData = {
        method: 'add',
        mainData: thisElement,
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

    let selecterView = (<>{data[selectCategory].body.map(el => (
        <div key={el.id} style={{
            position: 'absolute',
            marginLeft: String(((el.id - 1) % 3) * (window.innerWidth - 20) / data[selectCategory].body.length + 'px'),
            width: String((window.innerWidth - 30) / data[selectCategory].body.length) + 'px',
            height: '100px'
        }}>
            <div style={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                height: '95px',
                overflow: 'hidden',
                width: String((window.innerWidth - 30) / data[selectCategory].body.length) + 'px',
            }} onClick={() => {
                setSelectView(((el.id - 1) % 3))
            }}>
                <div style={{
                    color: 'white',
                    height: '70px',
                    display: 'grid',
                    gridTemplateRows: '1fr 1fr',
                    justifyItems: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{fontSize: '13px'}}>{el.view}</div>
                    <div style={{fontSize: '22px'}}>{el.price + ' ₽'}</div>
                </div>
            </div>
        </div>
    ))}</>)
    let scrollerView = (<>
        <div style={{
            display: 'grid',
            alignItems: 'center',
            width: String(window.innerWidth - 20) + 'px',
            border: '1px gray solid',
            borderRadius: '10px',
        }}>
            <div style={{
                background: '#414BE0FF',
                width: String(((window.innerWidth - 20 - 2 - 2) - (data[selectCategory].body.length - 1) * 2) / data[selectCategory].body.length) + 'px',
                height: '95px',
                borderRadius: '7px',
                marginTop: '2px',
                marginBottom: '2px',
                marginRight: '2px',
                position: 'relative',
                marginLeft: String(cordView) + 'px',
                transitionProperty: 'margin-left',
                transitionDuration: '0.2s',
            }}></div>
            {data[selectCategory].body.map(el => (
                <div key={el.id} style={{
                    position: 'absolute',
                    marginLeft: String(((el.id - 1) % 3) * (window.innerWidth - 20) / data[selectCategory].body.length + 'px'),
                    width: String((window.innerWidth - 30) / data[selectCategory].body.length) + 'px',
                    height: '100px'
                }}>
                    <div style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        height: '95px',
                        overflow: 'hidden',
                        width: String((window.innerWidth - 30) / data[selectCategory].body.length) + 'px',
                    }} onClick={() => {
                        setSelectView(((el.id - 1) % 3))
                    }}>
                        <div style={{
                            color: 'white',
                            height: '70px',
                            display: 'grid',
                            gridTemplateRows: '1fr 1fr',
                            justifyItems: 'center',
                            alignItems: 'center'
                        }}>
                            <div style={{fontSize: '13px', fontFamily: "'Montserrat', sans-serif"}}>{el.view}</div>
                            <div style={{
                                fontSize: '22px',
                                fontFamily: "'Montserrat', sans-serif"
                            }}>{el.price + ' ₽'}</div>
                        </div>
                    </div>
                </div>
            ))}

        </div>
    </>)

    if (data[0].body.length > 3) {
        let cordView = selectView * ((window.innerWidth - 20) / 3) - scrollLeft
        const windowWidth = window.innerWidth
        scrollerView = (<div style={{overflowX: 'hidden'}}>
            <div style={{
                display: 'grid',
                alignItems: 'center',
                width: String(((window.innerWidth - 20))) + 'px',
                border: '1px gray solid',
                borderRadius: '10px',

            }}>
                <div style={{
                    background: '#414BE0FF',
                    width: String(((window.innerWidth - 20) / 3 + 2)) + 'px',
                    height: '95px',
                    borderRadius: '7px',
                    marginTop: '2px',
                    marginBottom: '2px',
                    marginRight: '2px',
                    position: 'relative',
                    marginLeft: String(cordView) + 'px',
                }}></div>
                <div style={{
                    width: String(window.innerWidth - 20) + 'px',
                    overflowX: "scroll",
                    position: "absolute",
                    height: '100px',
                    display: 'flex'
                }}
                     onScroll={(event) => {
                         setScrollLeft(event.target.scrollLeft)
                     }}>
                    {data[selectCategory].body.map(el => (
                        <div key={data[selectCategory].body.indexOf(el)} style={{
                            width: String(((window.innerWidth - 20) / 3)) + 'px',
                            height: '70px'
                        }}>
                            <div style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                height: '95px',
                                overflow: 'hidden',
                                width: ((window.innerWidth - 20) / 3) + 'px',
                            }} onClick={() => {
                                setSelectView((data[selectCategory].body.indexOf(el) % data[selectCategory].body.length))
                            }}>
                                <div style={{
                                    color: 'white',
                                    height: '70px',
                                    display: 'grid',
                                    gridTemplateRows: '1fr 1fr',
                                    justifyItems: 'center',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '13px',
                                        fontFamily: "'Montserrat', sans-serif"
                                    }}>{el.view}</div>
                                    <div style={{
                                        fontSize: '22px',
                                        fontFamily: "'Montserrat', sans-serif"
                                    }}>{el.price + ' ₽'}</div>
                                </div>
                            </div>
                        </div>
                    ))}</div>

            </div>
        </div>)
    }
    return (
        <div>
            <div style={{
                background: '#454545', borderRadius: '10px', marginLeft: '10px',
                marginRight: '10px',
                width: String(window.innerWidth - 20) + 'px',
                marginTop: '10px',
                paddingBottom: '5px'
            }}>
                <div className={'img-wrap'} onClick={resizeImg}
                     style={{
                         width: String(window.innerWidth - 20) + 'px', height: String(heightImg) + 'px',
                         transitionProperty: 'height',
                         transitionDuration: '0.2s', transitionBehavior: 'allow-discrete'
                     }}>
                    <img src={url}
                         style={{borderTopRightRadius: '10px', borderTopLeftRadius: '10px',}}/>
                </div>
                <div style={{
                    color: 'white',
                    fontSize: '22px',
                    textAlign: 'center',
                    fontFamily: "'Montserrat', sans-serif",
                    marginTop: '7px',
                    marginBottom: '7px'
                }}>{thisElement.title + ' ' + thisElement.view}</div>
                <div style={{
                    display: 'grid',
                    alignItems: 'center',
                    width: String(window.innerWidth - 20) + 'px',
                    border: '1px gray solid',
                    borderRadius: '7px',
                    marginBottom: '7px'
                }}>
                    <div style={{
                        background: '#414BE0FF',
                        width: String(((window.innerWidth - 20 - 2 - 2) - (data.length - 1) * 2) / data.length) + 'px',
                        height: '45px',
                        marginTop: '2px',
                        marginBottom: '2px',
                        borderRadius: '5px',
                        position: 'relative',
                        marginLeft: String(cordCategory) + 'px',
                        transitionProperty: 'margin-left',
                        transitionDuration: '0.2s',
                    }}></div>

                    {data.map(el => (
                        <div key={el.id} style={{
                            position: 'absolute',
                            marginLeft: String((el.id) * (window.innerWidth - 20) / data.length) + 'px',
                            width: String((window.innerWidth - 30) / data.length) + 'px',
                            height: '50px'
                        }}>
                            <div style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                height: '50px',
                                overflow: 'hidden',
                            }} onClick={() => {
                                setSelectCategory(el.id)
                                setSelectView(0)
                            }}>
                                <div style={{color: 'white', fontFamily: "'Montserrat', sans-serif"}}>
                                    {el.title}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
                {scrollerView}
                <div style={{marginLeft: '10px', width: String(window.innerWidth - 40) + 'px'}}>
                    <div style={{
                        marginTop: '7px',
                        fontSize: '14px',
                        color: 'white',
                        textWrap: 'wrap',
                        fontFamily: "'Montserrat', sans-serif"
                    }}>Описание:
                    </div>
                    <div style={{
                        marginTop: '7px',
                        fontSize: '14px',
                        color: 'white',
                        textWrap: 'wrap',
                        fontFamily: "'Montserrat', sans-serif"
                    }}>{thisElement.description}
                    </div>
                    <div style={{
                        marginTop: '7px',
                        fontSize: '14px',
                        color: 'white',
                        textWrap: 'wrap',
                        fontFamily: "'Montserrat', sans-serif"
                    }}>{'Платформа: ' + thisElement.platform}
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

export default ProductListSelector;