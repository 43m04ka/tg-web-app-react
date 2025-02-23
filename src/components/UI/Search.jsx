import React, {useCallback, useEffect, useRef} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {useTelegram} from "../../hooks/useTelegram";

let lastListRes = []
let lastText = ''
let lastScroll = 0
const Search = ({height, page, setData}) => {
    const [listRes, setListRes] = React.useState(lastListRes);
    const [status, setStatus] = React.useState(1);
    const [textInput, setTextInput] = React.useState('');
    const textRef = useRef();
    const scrollRef = useRef();
    const {tg} = useTelegram();
    const navigate = useNavigate();

    const onChangeEmpty = (event) => {
        let allCard = []
        let result = null
        allCard.map(card => {
            if (card.title.toLowerCase().includes(valueInput.toLowerCase())) {
                result = [...result, card]
            }
        })

    }

    let dataRequestDatabase = {
        method: 'getSearch',
        data: {str: textInput, page: page}
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
                    setListRes(prom.cards)
                    lastListRes = prom.cards
                    setData(prom.cards)
                    console.log(prom.cards)
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
            if (typeof item.body.platform !== 'undefined') {
                if (typeof item.body.view === 'undefined') {
                    platform = item.body.platform
                } else {
                    platform = item.body.view
                }
            } else {
                platform = ''
            }

            let oldPrice = ''
            let parcent = ''
            if (typeof item.body.oldPrice === 'undefined') {
                if (typeof item.body.releaseDate === 'undefined') {
                    parcent = ''
                } else {
                    parcent = item.body.releaseDate.replace('#', '')
                    parcent = parcent.slice(0, 6) + parcent.slice(8, 10)
                }
            } else {
                oldPrice = String(item.body.oldPrice) + ' ₽'
                parcent = '−' + String(Math.ceil((1 - item.body.price / item.body.oldPrice) * 100)) + '%'
            }
            let parcentEl = (<div></div>)
            if (parcent !== '') {
                parcentEl = (<div style={{
                    lineHeight: '20px',
                    background: '#ff5d5d',
                    paddingLeft: '3px',
                    paddingRight: '3px',
                    borderRadius: '5px',
                    marginBottom: '5px',
                    textDecoration: 'none',
                    textAlign: 'left',
                    marginRight: '5px',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '12px',
                    overflow: 'hidden',
                    color: 'white',
                    width: 'max-content'
                }}>{parcent}</div>)
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
                                backgroundImage: 'url("' + item.body.img + '+")',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: 'cover',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'end',
                                height: '75px',
                                width: '75px',
                                paddingLeft:'5px',
                                borderRadius:'7px'
                            }}>
                                {parcentEl}
                            </div>
                        </div>
                        <div className={'box-grid-row'}>
                            <div className={'text-element text-basket'} style={{
                                marginTop: '3px',
                                lineHeight: '15px',
                                height: '30px',
                                fontSize: '13px',
                                overflow: 'hidden'
                            }}>{item.body.title}</div>
                            <div className={'text-element text-basket'} style={{
                                marginTop: '3px',
                                lineHeight: '14px',
                                height: '14px',
                                fontSize: '9px',
                                overflow: 'hidden',
                                marginBottom: '0px'
                            }}>{platform}</div>
                            <div className={'text-element text-basket'} style={{
                                lineHeight: '15px',
                                marginTop: '0',
                                height: '15px',
                                fontSize: '15px'
                            }}>{item.body.price + ' ₽'}</div>
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