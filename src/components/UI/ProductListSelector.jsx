import React, {useCallback, useEffect} from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";
import {useServer} from "../../hooks/useServer";
import mainPage from "./pages/Main/MainPage";

const ProductListSelector = ({basketData}) => {
    const [selectCategory, setSelectCategory] = React.useState(0);
    const [selectView, setSelectView] = React.useState(0);
    const [isImgHidden, setIsImgHidden] = React.useState(true);
    const [isBuy, setIsBuy] = React.useState(false);
    const [buttonText, setButtonText] = React.useState('Добавить в корзину');
    const [scrollLeft, setScrollLeft] = React.useState(0);
    const [cardList, setCardList] = React.useState([]);
    const {tg, user} = useTelegram();
    const navigate = useNavigate();
    const {findCardsByCatalog} = useServer()

    useEffect(() => {
        findCardsByCatalog(window.location.pathname.replace('/choice-catalog/', ''), setCardList).then()
    }, [])

    const onBack = useCallback(async () => {
        navigate(-1);
    }, [])

    const onBasket = useCallback(async () => {
        navigate('/basket'+cardList[0]?.body.tab);

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

    const onSendData = async (user, method, mainData) => {
        await fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/basket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user:user, method:method, mainData:mainData})
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
    }


    if(cardList.length > 0) {

        let dataOld = cardList.sort(function (a, b) {
            try {
                if (a.body.position > b.body.position) {
                    return 1;
                }
                if (a.body.position < b.body.position) {
                    return -1;
                }
            } catch (e) {
            }
            try {
                if (a.body.category > b.body.category) {
                    return 1;
                }
                if (a.body.category < b.body.category) {
                    return -1;
                }
            } catch (e) {
            }
        });

        let data = []
        let lastName = ''
        let vsArray = []
        let lastId = 0
        dataOld.map(el => {
            if (lastName !== el.body.category) {
                data = [...data, ...vsArray]
                lastName = el.body.category
                vsArray = [{}]
                vsArray[0].id = lastId
                vsArray[0].body = [el]
                vsArray[0].title = el.body.category
                lastId += 1
            } else {
                vsArray[0].body = [...vsArray[0].body, ...[el]]
            }

        })
        data = [...data, ...vsArray]

        let count = 0
        data.map(el => {
            data[count].body = el.body.sort(function (a, b) {
                try {
                    if (Number(a.body.view.split(' ')[0]) > Number(b.body.view.split(' ')[0])) {
                        return 1;
                    }
                    if (Number(a.body.view.split(' ')[0]) < Number(b.body.view.split(' ')[0])) {
                        return -1;
                    }
                } catch (e) {
                }
                try {
                    if (Number(a.body.view) > Number(b.body.view)) {
                        return 1;
                    }
                    if (Number(a.body.view) < Number(b.body.view)) {
                        return -1;
                    }
                } catch (e) {
                }
            })
            count++
        })

        count = 0
        data.map(cat=>{
            cat.body.map(el=>{
                el.body.localId = count
                count++
            })
        })

        let cordCategory = (window.innerWidth - 20 - 2 - 2) / data.length * selectCategory + 1.5
        let cordView = (window.innerWidth - 20 - 2 - 2) / data[selectCategory].body.length * selectView + 1.5

        let url = data[selectCategory].body[selectView].body.img

        let thisElement = data[selectCategory].body[selectView]

        let flag = false
        basketData.map(pos=>{
            if(pos.id === thisElement.id) {
                flag = true
            }
        })

        if(isBuy !== flag && thisElement?.body.isSale){
            setIsBuy(flag);
            if(flag){
                setButtonText('Перейти в корзину');
            }else{
                setButtonText('Добавить в корзину')
            }
        }

        if(!thisElement?.body.isSale && isBuy !== null){
            setIsBuy(null)
            setButtonText('Нет в продаже')
        }

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

        let buttonColor = '#51a456'
        let buttonLink = () => {
            onSendData(user, 'add', thisElement.id);
            setButtonText('Ожидайте...');
        }
        if (isBuy) {
            buttonColor = '#414BE0FF'
            buttonLink = () => {
                onBasket()
            }
        }

        if(!thisElement?.body.isSale){
            buttonColor = '#8e8f9e'
            buttonLink = () => {
            }
        }

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
                {data[selectCategory].body.map(el => {
                    return (
                        <div key={el.localId} style={{
                            position: 'absolute',
                            marginLeft: String(((el.body.localId) % data[selectCategory].body.length) * (window.innerWidth - 20) / data[selectCategory].body.length + 'px'),
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
                                setSelectView(((el.body.localId) % data[selectCategory].body.length))
                            }}>
                                <div style={{
                                    color: 'white',
                                    height: '70px',
                                    display: 'grid',
                                    gridTemplateRows: '1fr 1fr',
                                    justifyItems: 'center',
                                    alignItems: 'center'
                                }}>
                                    <div style={{fontSize: '13px', fontFamily: "'Montserrat', sans-serif"}}>{el.body.view}</div>
                                    <div style={{
                                        fontSize: '22px',
                                        fontFamily: "'Montserrat', sans-serif"
                                    }}>{Math.min(...el.price) + ' ₽'}</div>
                                </div>
                            </div>
                        </div>
                    )
                })}

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
                                        }}>{el.body.view}</div>
                                        <div style={{
                                            fontSize: '22px',
                                            fontFamily: "'Montserrat', sans-serif"
                                        }}>{Math.min(...el.price) + ' ₽'}</div>
                                    </div>
                                </div>
                            </div>
                        ))}</div>

                </div>
            </div>)
        }

        let platform = ''
        if (typeof thisElement.body.platform === 'undefined') {
            platform = ''
        } else {
            platform = 'Консоли: ' + thisElement.body.platform
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
                    }}>{thisElement.body.title + ' ' + thisElement.body.view}</div>
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
                                height: '50px',
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
                        }}>{thisElement.body.description}
                        </div>
                        <div style={{
                            marginTop: '7px',
                            fontSize: '14px',
                            color: 'white',
                            textWrap: 'wrap',
                            fontFamily: "'Montserrat', sans-serif"
                        }}>{platform}
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
    }else{
        return (<div className={'plup-loader'} style={{
            marginTop: String(window.innerHeight / 2 - 50) + 'px',
            marginLeft: String(window.innerWidth / 2 - 50) + 'px'
        }}></div>)
    }
};

export default ProductListSelector;