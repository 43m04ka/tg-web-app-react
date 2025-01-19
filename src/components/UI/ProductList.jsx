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

let oldFilterHeight = window.innerHeight - 250
let scrollCtrl = 0;

const ProductList = ({main_data, page, height, setData, setStatusApp}) => {
    console.log(1)
    const [products, setProducts] = useState([])
    const [status, setStatus] = useState(0);
    const path = main_data.path
    const {tg} = useTelegram();
    const [len, setLen] = useState(0);
    const navigate = useNavigate();
    let list = 1
    const [listNumber, setListNumber] = useState(1);
    const [jsonFilter, setJsonFilter] = useState(null);
    const [panelIsVisible, setPanelIsVisible] = useState(false);
    const [panelWidth, setPanelWidth] = useState(0);
    const [hiddenSelector, setHiddenSelector] = useState(false);
    const [heightMenuButton, setHeightMenuButton] = useState(65);


    let dataRequestDatabase = {
        method: 'getList',
        data: {}
    }

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
                    await setProducts(prom.cards)
                    await setData(prom.cards)
                    await setLen(prom.len)
                    await setStatus(1)
                    await setPanelIsVisible(false)
                    await setPanelWidth(0)
                }
            })
        })
    }, [dataRequestDatabase])

    const sendRequestOnDatabase = (inputData, operation) => {
        dataRequestDatabase.method = operation
        dataRequestDatabase.data = inputData
        sendRequestDatabase()
    }

    const onBack = useCallback(() => {
        setStatusApp(0)
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

    let nav1El = (<div></div>)
    let nav2El = (<div></div>)
    let nav3El = (<div></div>)
    let nav4El = (<div></div>)
    if (listNumber > 1) {
        nav1El = (<div onClick={() => {
            list = 1;
            if (jsonFilter === null) {
                sendRequestOnDatabase({path: path, number: list}, 'getList')
            } else {
                sendRequestOnDatabase({path: path, number: list, filter: jsonFilter}, 'getList')
            }
            setListNumber(list)
            setStatus(10)
        }}
                       className={'text-element'} style={{
            height: '20px',
            width: '20px',
            textAlign: 'center',
            lineHeight: '20px',
            borderRadius: '5px',
            border: '1px solid gray',
        }}>{1}</div>)
        nav2El = (<div onClick={() => {
            list = listNumber - 1;
            if (jsonFilter === null) {
                sendRequestOnDatabase({path: path, number: list}, 'getList')
            } else {
                sendRequestOnDatabase({path: path, number: list, filter: jsonFilter}, 'getList')
            }
            setListNumber(list);
            setStatus(10)
        }}
                       className={'background-arrow'} style={{
            height: '20px',
            width: '20px',
            textAlign: 'center',
            lineHeight: '20px',
            borderRadius: '50%',
            rotate: '180deg'
        }}></div>)
    }
    if (listNumber < len) {
        nav3El = (<div onClick={() => {
            list = len;
            if (jsonFilter === null) {
                sendRequestOnDatabase({path: path, number: list}, 'getList')
            } else {
                sendRequestOnDatabase({path: path, number: list, filter: jsonFilter}, 'getList')
            }
            setListNumber(list);
            setStatus(10)
        }}
                       className={'text-element'} style={{
            height: '20px',
            width: '20px',
            textAlign: 'center',
            lineHeight: '20px',
            borderRadius: '5px',
            border: '1px solid gray',
        }}>{len}</div>)

        nav4El = (<div onClick={() => {
            list = listNumber + 1;
            if (jsonFilter === null) {
                sendRequestOnDatabase({path: path, number: list}, 'getList')
            } else {
                sendRequestOnDatabase({path: path, number: list, filter: jsonFilter}, 'getList')
            }
            setListNumber(list)
            setStatus(10)
        }}
                       className={'background-arrow'} style={{
            height: '20px',
            width: '20px',
            textAlign: 'center',
            lineHeight: '20px',
            borderRadius: '50%',
        }}></div>)
    }

    let elementKeys = []
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
            } else {
                elementKeys = [...elementKeys, 'platformXB']
            }
        }
    } catch (e) {
    }

    try {
        if (typeof products[0].languageSelector !== 'undefined') {
            elementKeys = [...elementKeys, 'languageSelector']

        }
    } catch (e) {
    }

    try {
        if (typeof products[0].languageSelector !== 'undefined') {
            elementKeys = [...elementKeys, 'languageSelector']

        }
    } catch (e) {
    }

    const onRequestFilter = (json) => {
        setJsonFilter(json)
        if (json === null) {
            sendRequestOnDatabase({path: path, number: 1}, 'getList')
        } else {
            sendRequestOnDatabase({path: path, number: 1, filter: json}, 'getList')
        }
        setListNumber(1)
    }

    let bodyElement = (<div>
            <div className={'list-grid'}>
                {products.map(item => {
                    let newItem = item.body
                    newItem.id = item.id
                    return (<ProductItem key={newItem.id} product={newItem} path={path}/>)
                })}
            </div>
            <div style={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                marginTop: '15px',
                marginBottom: '15px',
            }}>
                {nav2El}
                {nav1El}
                <div className={'text-element'} style={{
                    height: '20px',
                    width: '20px',
                    textAlign: 'center',
                    lineHeight: '20px',
                    borderRadius: '5px',
                    border: '1px solid gray',
                    background: '#6194ea'
                }}>{listNumber}</div>
                {nav3El}
                {nav4El}
            </div>
        </div>
    )
    if (status === 10) {
        bodyElement = (<div className={'pong-loader'} style={{
            border: '2px solid #8cdb8b',
            marginTop: String(window.innerHeight / 2 - 60) + 'px',
            marginLeft: String(window.innerWidth / 2 - 40) + 'px'
        }}></div>)
    }

    if (status === 1 || status === 10) {
        return (
            <div className={'list'} style={{display: 'flex', flexDirection: 'column'}}>
                <div className={'box-grid-panel'} style={{
                    height: String(heightMenuButton) + 'px',
                    overflow: 'hidden',
                    transitionProperty: 'height',
                    transitionDuration: '0.3s',
                    position: 'absolute',
                    background: '#171717',
                    width:String(window.innerWidth)+'px',
                    borderBottom:'2px solid #454545',
                }}>
                    <Link to={'/search' + String(page)} className={'link-element'}>
                        <div className={'search'} style={{padding: '10px', display: 'flex', flexDirection: 'row'}}>
                            <div className={'background-search'} style={{width: '25px', height: '25px'}}></div>
                            <div style={{
                                height: '25px',
                                alignContent: 'center',
                                marginLeft: '3px',
                                fontSize: "16px",
                                color: 'black',
                                fontFamily: "'Montserrat', sans-serif",
                                fontVariant: 'small-caps'
                            }}>Найти игру, подписку...
                            </div>
                        </div>
                    </Link>
                    <Link to={'/basket' + page} className={'link-element'}>
                        <div className={'div-button-panel'} style={{padding: '3px'}}>
                            <div className={'background-basket'} style={{width: '100%', height: '100%'}}></div>
                        </div>
                    </Link>
                    <Link to={'/info'} className={'link-element'}>
                        <div className={'div-button-panel'} style={{padding: '6px'}}>
                            <div className={'background-profile'} style={{width: '100%', height: '100%'}}></div>
                        </div>
                    </Link>
                </div>
                <div className={'scroll-container-y'}
                     onScroll={(event) => {
                         let scroll = event.target.scrollTop
                         if (scroll > scrollCtrl + 200 && !hiddenSelector) {
                             scrollCtrl = scroll
                             setHiddenSelector(true)
                             setHeightMenuButton(0)
                         } else if ((scroll < scrollCtrl - 100 || scroll === 0) && hiddenSelector) {
                             scrollCtrl = scroll
                             setHiddenSelector(false)
                             setHeightMenuButton(65)
                         }
                         if (hiddenSelector && scroll > scrollCtrl) {
                             scrollCtrl = scroll
                         } else if (!hiddenSelector && scroll < scrollCtrl) {
                             scrollCtrl = scroll
                         }
                     }}
                     style={{
                         height: String(height - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px'
                     }}>
                    <div style={{
                        height: String(60) + 'px'
                    }}>
                        <div style={{height: '300px', overflow: 'hidden'}}></div>
                    </div>
                    {bodyElement}
                    <div style={{
                        position: 'absolute', marginTop: String(heightMenuButton-5) + 'px',transitionProperty:'margin',transitionDuration:'0.3s'
                    }}>
                        <Filter height={height + 60 - heightMenuButton} elementKeys={elementKeys}
                                onRequestFilter={onRequestFilter}
                                panelIsVisible={panelIsVisible} setPanelIsVisible={setPanelIsVisible}
                                panelWidth={panelWidth} setPanelWidth={setPanelWidth}/>
                    </div>
                </div>
            </div>
        );
    } else if (status === 0) {
        sendRequestOnDatabase({path: path, number: 1}, 'getList')

        return (<div className={'pong-loader'} style={{
            border: '2px solid #8cdb8b',
            marginTop: String(window.innerHeight / 2 - 60) + 'px',
            marginLeft: String(window.innerWidth / 2 - 40) + 'px'
        }}></div>)
    }

};

export default ProductList;