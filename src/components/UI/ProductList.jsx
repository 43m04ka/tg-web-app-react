import React, {useRef, useState} from 'react';
import '../styles/style.css';
import ProductItem from "./ProductItem";
import {useTelegram} from "../../hooks/useTelegram";
import {useCallback, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import Filter from "./Filter";


const getTotalPrice = (items = []) => {
    return items.reduce((acc, item) => {
        return acc += item.price
    }, 0)
}

let scrollCtrl = 0;
let list = 1
let bool = true
let elementKeys = []

let lastScroll = 0
let lastList = []
let lastLen = 1

let lastPath = ''
const ProductList = ({height, setDataDop}) => {

    let stStatus = 0
    if (lastList.length !== 0) {
        stStatus = (1)
    }

    const [products, setProducts] = useState(lastList)
    let page = 0
    if(typeof products[0]?.body !== "undefined") {
        page = products[0].body.tab
    }
    const [status, setStatus] = useState(stStatus);
    const path = (window.location.pathname).replace('/home/', '')
    if(lastPath !== path){
        lastPath = path
        scrollCtrl = 0;
        list = 1
        bool = true
         elementKeys = []

        lastScroll = 0
        lastList = []
        lastLen = 1
    }
    const {tg, user} = useTelegram();
    const [len, setLen] = useState(lastLen);
    const navigate = useNavigate();
    const [listNumber, setListNumber] = useState(list);
    const [jsonFilter, setJsonFilter] = useState(null);
    const [hiddenSelector, setHiddenSelector] = useState(false);
    const [heightMenuButton, setHeightMenuButton] = useState(50);
    const [basketLen, setBasketLen] = useState(0);
    const [basketData, setBasketData] = useState([]);
    const scrollRef = useRef();

    let dataRequestDatabase = {
        method: 'getList',
        data: {}
    }


    let newArray = []
    basketData.map(el => {
        if (Number(el.body.tab) === -1 && el.body.isSale === true) {
            newArray = [...newArray, el]
        }
    })
    if (newArray.length !== basketLen) {
        setBasketLen(newArray.length)
    }

    const sendData = {
        method: 'get',
        user: user,
    }

    const onGetData = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/basket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendData)
        }).then(r => {
            let Promise = r.json()
            Promise.then(r => {
                setBasketData(r.body);
            })
        })
    }, [sendData])


    const sendRequestDatabase = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataRequestDatabase)
        }).then(r => {
            let Promise = r.json()
            Promise.then(async prom => {
                if (dataRequestDatabase.method === 'getList') {
                    console.log(lastList.length)
                    if (lastList.length > 0) {
                        lastList = [...products, ...prom.cards] || []
                        await setProducts([...products, ...prom.cards] || [])
                        await setDataDop([...products, ...prom.cards] || [])
                        await setStatus(1)
                    }else {
                        lastList = prom.cards || []
                        await setProducts(prom.cards || [])
                        await setDataDop(prom.cards || [])
                        await setLen(prom.len)
                        lastLen = prom.len
                        await setHeightMenuButton(50)
                        await setStatus(1)
                    }
                }
            })
        })
    }, [dataRequestDatabase])

    let basketKolElement = (<></>)
    if (basketLen !== null && basketLen !== 0) {
        basketKolElement = (<div className={'text-element'} style={{
            background: '#f83d3d',
            fontSize: '9px',
            height: '16px',
            width: '16px',
            borderRadius: "50%",
            textAlign: 'center',
            lineHeight: '16px',
            position: 'absolute',
            marginLeft: '22px',
            marginTop: '22px'
        }}>{basketLen}</div>)
    }

    const sendRequestOnDatabase = (inputData, operation) => {
        dataRequestDatabase.method = operation
        dataRequestDatabase.data = inputData
        sendRequestDatabase()
    }

    const onBack = useCallback(() => {
        navigate(-1);
        lastList = []
        lastLen = 1
        lastScroll = 0
        elementKeys = []
        list = 1
    }, [])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])

    useEffect(() => {
        if (status === 0) {
            sendRequestOnDatabase({path: path, number: list}, 'getList')
            onGetData()
            setStatus(10)
        }
        tg.BackButton.show();
        try {
            scrollRef.current.scrollTo({
                top: lastScroll,
                behavior: "instant",
            });
        } catch (e) {
        }
    }, [scrollRef])

    let plupLoaderElem = (<div></div>)
    if(status === 11){
        plupLoaderElem = (<div className={'plup-loader'} style={{
            marginTop: '10px',
            marginLeft: String(window.innerWidth / 2 - 50) + 'px'
        }}></div>)
    }

    if (bool || elementKeys.length === 0) {
        try {
            if (typeof products[0].body.category !== 'undefined') {
                if (products[0].body.category.includes('акк')) {
                    elementKeys = [...elementKeys, 'categoryXB']
                }
            }
        } catch (e) {
        }

        try {
            if (typeof products[0].body.platform !== 'undefined') {
                if (products[0].body.platform.includes('PS4') || products[0].body.platform.includes('PS5')) {
                    elementKeys = [...elementKeys, 'platformPS']
                } else if (products[0].body.platform.includes('One') || products[0].body.platform.includes('Series')) {
                    elementKeys = [...elementKeys, 'platformXB']
                }
            }
        } catch (e) {
        }

        try {
            if (typeof products[0].body.languageSelector !== 'undefined') {
                elementKeys = [...elementKeys, 'languageSelector']
            }
        } catch (e) {
        }

        try {
            if (typeof products[0].body.numPlayers !== 'undefined') {
                if (String(products[0].body.numPlayers) === '1' || products[0].body.numPlayers.includes('-')) {
                    elementKeys = [...elementKeys, 'numPlayers']
                }
            }
        } catch (e) {
        }
        bool = false
    }

    const onRequestFilter = (json) => {
        setStatus(10)
        lastList = []
        setJsonFilter(json)
        list = 1
        setListNumber(1)
        setProducts([])
        if (json === null) {
            sendRequestOnDatabase({path: path, number: 1}, 'getList')
        } else {
            sendRequestOnDatabase({path: path, number: 1, filter: json}, 'getList')
        }
    }
    let bodyElement = (<div/>)

    if (products.length !== 0) {
        bodyElement = (<div>
                <div className={'list-grid'}>
                    {products.map(item => {
                        return (
                            <div style={{marginLeft: String((window.innerWidth - 150 - 150) / 3) + 'px'}}><ProductItem key={item.id} product={item} path={path}/></div>)
                    })}
                </div>
                {plupLoaderElem}
                <div
                    style={{height: String(tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom + 10) + 'px'}}></div>
            </div>
        )
    } else {
        bodyElement = (<div>
            <div className={'text-element'} style={{textAlign: 'center', marginTop: '30px', fontSize: '18px'}}>Ничего не
                найдено
            </div>
            <button className={'all-see-button'} onClick={() => {
                setStatus(10);
                sendRequestOnDatabase({path: path, number: list}, 'getList')
            }}>Сбросить фильтры
            </button>
        </div>)
    }
    if (status === 10) {
        bodyElement = (<div className={'plup-loader'} style={{
            marginTop: String(window.innerHeight / 2 - 50) + 'px',
            marginLeft: String(window.innerWidth / 2 - 50) + 'px'
        }}></div>)
    }

    if (status === 1 || status === 10 || status === 11) {
        return (
            <div className={'list'} style={{display: 'flex', flexDirection: 'column'}}>
                <div className={'box-grid-panel'} style={{
                    height: String(heightMenuButton) + 'px',
                    overflow: 'hidden',
                    transitionProperty: 'height',
                    transitionDuration: '0.3s',
                    position: 'absolute',
                    background: '#171717',
                    width: String(window.innerWidth) + 'px',
                    borderBottom: '2px solid #454545',
                }}>
                    <Link to={'/search' + String(page)} className={'link-element'}>
                        <div className={'search'} style={{padding: '7px', display: 'flex', flexDirection: 'row'}}>
                            <div className={'background-search'} style={{width: '21px', height: '21px'}}></div>
                            <div style={{
                                height: '20px',
                                alignContent: 'center',
                                marginLeft: '3px',
                                fontSize: "14px",
                                color: 'black',
                                fontFamily: "'Montserrat', sans-serif",
                                fontVariant: 'small-caps'
                            }}>Найти игру, подписку...
                            </div>
                        </div>
                    </Link>
                    <Link to={'/basket' + page} className={'link-element'}>
                        <div className={'div-button-panel'} style={{padding: '3px'}}>
                            <div className={'background-basket'} style={{width: '100%', height: '100%'}}>
                                {basketKolElement}
                            </div>
                        </div>
                    </Link>
                    <Link to={'/info'} className={'link-element'}>
                        <div className={'div-button-panel'} style={{padding: '6px'}}>
                            <div className={'background-profile'} style={{width: '100%', height: '100%'}}></div>
                        </div>
                    </Link>
                </div>
                <div className={'scroll-container-y'} ref={scrollRef}
                     onScroll={async (event) => {
                         let scroll = event.target.scrollTop
                         let scrollHeight = scrollRef.current.scrollHeight

                         if (listNumber < len && scroll + 1200 > scrollHeight && status !== 11) {
                             list = listNumber + 1;
                             await setStatus(11)
                             await setListNumber(list)
                             if (jsonFilter === null) {
                                 await sendRequestOnDatabase({path: path, number: list}, 'getList')
                             } else {
                                 await sendRequestOnDatabase({path: path, number: list, filter: jsonFilter}, 'getList')
                             }
                         }

                         lastScroll = scroll
                         if (scroll > scrollCtrl + 200 && !hiddenSelector) {
                             scrollCtrl = scroll
                             setHiddenSelector(true)
                             setHeightMenuButton(0)
                         } else if ((scroll < scrollCtrl - 100 || scroll === 0) && hiddenSelector) {
                             scrollCtrl = scroll
                             setHiddenSelector(false)
                             setHeightMenuButton(50)
                         }
                         if (hiddenSelector && scroll > scrollCtrl) {
                             scrollCtrl = scroll
                         } else if (!hiddenSelector && scroll < scrollCtrl) {
                             scrollCtrl = scroll
                         }
                     }}
                     style={{
                         height: String(window.innerHeight - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
                     }}>
                    <div style={{
                        height: String(45) + 'px'
                    }}>
                        <div style={{height: '300px', overflow: 'hidden'}}></div>
                    </div>
                    {bodyElement}
                    <div style={{
                        position: 'absolute',
                        marginTop: String(heightMenuButton) + 'px',
                        transitionProperty: 'margin',
                        transitionDuration: '0.3s'
                    }}>
                        <Filter height={height + 50 - heightMenuButton} elementKeys={elementKeys}
                                onRequestFilter={onRequestFilter}/>
                    </div>
                </div>
            </div>
        );
    }

};

export default ProductList;


// sendRequestOnDatabase({path: path, number: list}, 'getList')
// onGetData()