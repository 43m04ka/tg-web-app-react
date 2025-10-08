import React, {useCallback, useEffect, useRef} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {useTelegram} from "../../hooks/useTelegram";
import useGlobalData from "../../hooks/useGlobalData";

let lastListRes = []
let lastText = ''
let lastScroll = 0
const Search = ({height}) => {
    const [listRes, setListRes] = React.useState(lastListRes);
    const [status, setStatus] = React.useState(1);
    const [textInput, setTextInput] = React.useState('');
    const textRef = useRef();
    const scrollRef = useRef();
    const {tg} = useTelegram();
    const {pageId} = useGlobalData()
    const navigate = useNavigate();

    let dataRequestDatabase = {
        method: 'getSearch',
        data: {str: textInput, pageId: pageId}
    }

    const sendRequestDatabase = useCallback(() => {
        console.log(dataRequestDatabase, 'inputRequestDb')
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataRequestDatabase)
        }).then(r => {
            let Promise = r.json()
            Promise.then(prom => {
                console.log(prom, 'возвратил get')
                if (dataRequestDatabase.method === 'getSearch') {
                    let resultList = []
                    prom.cards.map(card => {
                        let flag = true
                        resultList.map(resCard => {
                            if (card.name === resCard.name && card.similarCard?.price === resCard.similarCard?.price) {
                                flag = true
                            }
                        })
                        resultList.push(card)
                    })
                    setListRes(resultList)
                    lastListRes = resultList
                    if (prom.cards.length === 0) {
                        setStatus(3)
                    } else {
                        setStatus(1)
                    }
                }
            })
        })
    }, [dataRequestDatabase])

    const onBack = useCallback(() => {
        navigate(-1);
        lastScroll = 0
        lastText = ''
        lastListRes = []
    }, [])

    useEffect(() => {
        tg.BackButton.show();
        textRef.current.value = lastText;
        scrollRef.current.scrollTo({
            top: lastScroll,
            behavior: "instant",
        });
        if (lastListRes.length === 0) {
            textRef.current.focus()
        }
    }, [textRef, scrollRef])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            setStatus(0)
            textRef.current.blur();
            scrollRef.current.scrollTo({
                top: 0,
                behavior: "instant",
            });
            lastScroll = 0
            sendRequestDatabase()
        }
    };

    let bodyElement = (<div>
        {listRes.map((item) => {
            let platform = ''
            if (typeof item.platform !== 'undefined') {
                if (typeof item.view === 'undefined') {
                    platform = item.platform
                } else {
                    platform = item.view
                }
            } else {
                platform = ''
            }

            let oldPrice = ''
            let parcent = ''
            let price = item.price.toLocaleString() + ' ₽'
            let type = 0

            if (item.oldPrice !== null) {
                type = 1
                oldPrice = item.oldPrice.toLocaleString() + ' ₽'
                parcent = '−' + Math.ceil((1 - item.price / item.oldPrice) * 100) + '%'
            } else if (item.similarCard !== null) {
                type = 1
                price = item.similarCard?.price.toLocaleString() + ' ₽'
                if (typeof productData.similarCard.oldPrice !== 'undefined') {
                    oldPrice = item.similarCard?.oldPrice.toLocaleString() + ' ₽'
                    parcent = '−' + Math.ceil((1 - item.similarCard?.price / item.similarCard?.oldPrice) * 100) + '%'
                }
            }

            if (item.releaseDate !== null) {
                let a = (new Date(item.releaseDate)) * 24 * 60 * 60 * 1000
                let currentDate = new Date('1899-12-30T00:00:00.000Z')
                let newDate = new Date(a + currentDate.getTime());

                parcent = newDate.toLocaleDateString('ru-RU')
                parcent = parcent.slice(0, 6) + parcent.slice(8, 10)

                type = 2
            }

            let priceEl = (<div className={'text-element text-basket'} style={{
                lineHeight: '15px',
                marginTop: '0',
                height: '15px',
                fontSize: '15px',
            }}>{price}</div>)

            let oldPriceEl = (<div></div>)

            if (type === 1) {
                priceEl = (<div className={'text-element text-basket'} style={{
                    lineHeight: '15px',
                    marginTop: '0',
                    height: '15px',
                    fontSize: '15px',
                    color: '#ff5d5d',
                }}>{price}</div>)
                oldPriceEl = (<div className={'text-element text-basket'} style={{
                    lineHeight: '15px',
                    marginTop: '0',
                    height: '15px',
                    fontSize: '15px',
                    color: 'gray',
                    textDecoration: 'line-through'
                }}>{oldPrice}</div>)
            }
            if (type === 2) {
                oldPriceEl = (<div className={'text-element text-basket'} style={{
                    lineHeight: '15px',
                    marginTop: '0',
                    height: '15px',
                    fontSize: '15px',
                    color: '#4a9ed6',
                }}>Предзаказ {parcent}</div>)
            }

            return (
                <div className={'list-element'}
                     style={{marginLeft: '20px', width: String(window.innerWidth - 40) + 'px'}}>
                    <Link to={'/card/' + item.id} className={'link-element'}
                          style={{display: 'flex', flexDirection: 'row', justifyContent: 'left'}}>
                        <div style={{
                            height: '75px',
                            width: '75px',
                        }}>
                            <div style={{
                                backgroundImage: 'url("' + item.image + '+")',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: 'cover',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'end',
                                height: '75px',
                                width: '75px',
                                paddingLeft: '5px',
                                borderRadius: '7px'
                            }}>
                            </div>
                        </div>
                        <div className={'box-grid-row'}>
                            <div className={'text-element text-basket'} style={{
                                marginTop: '3px',
                                lineHeight: '15px',
                                height: '30px',
                                fontSize: '13px',
                                overflow: 'hidden'
                            }}>{item.name}</div>
                            <div className={'text-element text-basket'} style={{
                                marginTop: '3px',
                                lineHeight: '14px',
                                height: '14px',
                                fontSize: '9px',
                                overflow: 'hidden',
                                marginBottom: '0px'
                            }}>{platform}</div>
                            <div
                                style={{display: 'flex', justifyContent: 'left', alignItems: 'center', height: '15px'}}>
                                {priceEl}
                                {oldPriceEl}
                            </div>
                        </div>
                    </Link>
                </div>)
        })}
    </div>)
    if (listRes.length === 0) {
        bodyElement = (<div className={'background-searchFon'} style={{
            marginLeft: String(window.innerWidth / 2 - 125) + 'px',
            width: '250px',
            height: '250px',
            marginTop: String(window.innerHeight / 2 - 200) + 'px'
        }}/>)
    }
    if (status === 3) {
        bodyElement = (<div>
            <div className={'text-element'}
                 style={{textAlign: 'center', marginTop: String(window.innerHeight / 2 - 170) + 'px'}}>Ничего не
                найдено...
            </div>
            <div className={'background-searchFon'} style={{
                marginLeft: String(window.innerWidth / 2 - 125) + 'px',
                width: '250px',
                height: '250px',
            }}></div>
        </div>)
    }
    if (status === 1 || status === 3) {
        return (
            <div>
                <div style={{
                    borderBottom: '2px gray solid',
                    display: "grid",
                    gridTemplateColumns: '1fr 60px',
                    width: String(window.innerWidth) + 'px'
                }}>
                    <input className={'search'} placeholder={'Найти игру, подписку, валюту...'}
                           onChange={() => {
                               setTextInput(event.target.value);
                               lastText = event.target.value
                           }}
                           onKeyPress={handleKeyPress}
                           ref={textRef}
                           style={{
                               border: '0px', fontSize: '15px',
                               fontFamily: "'Montserrat', sans-serif",
                               paddingLeft: '7px',
                           }}></input>
                    <div className={'text-element'}
                         style={{
                             background: 'white',
                             marginTop: '7px',
                             marginBottom: '7px',
                             marginRight: '7px',
                             borderRadius: '7px',
                             color: 'black',
                             marginLeft: '0',
                         }} onClick={() => {
                        setStatus(0)
                        scrollRef.current.scrollTo({
                            top: 0,
                            behavior: "instant",
                        });
                        lastScroll = 0
                        sendRequestDatabase()
                    }}>
                        <div style={{textAlign: 'center', marginTop: '10px', lineHeight: '15px'}}>Найти</div>
                    </div>
                </div>
                <div className={'scroll-container-y'} style={{
                    height: String(height - 52 - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
                }}
                     onScroll={(event) => {
                         lastScroll = (event.target.scrollTop);
                     }} ref={scrollRef}>
                    {bodyElement}
                </div>
            </div>
        );
    }

    if (status === 0) {
        return (
            <div>
                <div style={{
                    borderBottom: '2px gray solid',
                    display: "grid",
                    gridTemplateColumns: '1fr 60px',
                    width: String(window.innerWidth) + 'px'
                }}>
                    <input className={'search'} placeholder={'Найти игру, подписку, валюту...'}
                           onChange={() => setTextInput(event.target.value)}
                           onKeyPress={handleKeyPress}
                           style={{
                               border: '0px', fontSize: '15px',
                               fontFamily: "'Montserrat', sans-serif",
                               paddingLeft: '7px',
                           }}></input>
                    <div className={'text-element'}
                         style={{
                             background: 'white',
                             marginTop: '7px',
                             marginBottom: '7px',
                             marginRight: '7px',
                             borderRadius: '7px',
                             color: 'black',
                             marginLeft: '0',
                         }} onClick={() => {
                        setStatus(0)
                        sendRequestDatabase()
                    }}>
                        <div style={{textAlign: 'center', marginTop: '10px', lineHeight: '15px'}}>Найти</div>
                    </div>
                </div>
                <div className={'plup-loader'} style={{
                    marginTop: String((window.innerHeight - 60) / 2 - 60) + 'px',
                    marginLeft: String(window.innerWidth / 2 - 40) + 'px'
                }}></div>
            </div>
        );
    }

}

export default Search;