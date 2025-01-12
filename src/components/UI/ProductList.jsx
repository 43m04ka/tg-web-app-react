import React, {useRef, useState} from 'react';
import '../styles/style.css';
import ProductItem from "./ProductItem";
import {useTelegram} from "../../hooks/useTelegram";
import {useCallback, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import FilterCheckBox from "./FilterCheckBox";


const getTotalPrice = (items = []) => {
    return items.reduce((acc, item) => {
        return acc += item.price
    }, 0)
}

let oldFilterHeight = window.innerHeight - 250

const ProductList = ({main_data, page, height, setData}) => {
    console.log(page)
    const [products, setProducts] = useState([])
    const [status, setStatus] = useState(0);
    const path = main_data.path
    const {tg} = useTelegram();
    const [len, setLen] = useState(0);
    const navigate = useNavigate();
    const [sortNap, setSortNap] = useState(true);
    const [stpSort, setStpSort] = useState('Цена↑');
    const [filterJson, setFilterJson] = useState({platform: [], category: [], languageSelector:[]});
    const [filterHeight, setFilterHeight] = useState(0);
    let list = 1
    const [listNumber, setListNumber] = useState(1);


    let dataRequestDatabase = {
        method: 'getList',
        data: {}
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
                if (dataRequestDatabase.method === 'getList') {
                    setProducts(prom.cards)
                    setData(prom.cards)
                    console.log(prom.cards)
                    setLen(prom.len)
                    setStatus(1)
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

    const onSort = () => {
        if (sortNap) {
            setSortNap(false)
            setStpSort('Цена↓')
        } else {
            setSortNap(true)
            setStpSort('Цена↑')
        }
    }

    if (sortNap) {
        products.sort((a, b) => (+(a.body.price - b.body.price)))
    } else {
        products.sort((a, b) => (+(b.body.price - a.body.price)));
    }


    const onSetFilter = (json) => {
        setFilterJson(json)
        setStatus(0)
    }


    let platformElementFilter = (<div></div>)
    try {
        if (typeof main_data.body[0].platform !== 'undefined') {
            if (main_data.body[0].platform.includes('PS')) {
                platformElementFilter =
                    <FilterCheckBox param={'platform'} data={['PS5', 'PS4']} json={filterJson} preview={'Платформа'}
                                    setJson={onSetFilter}/>
            } else if (main_data.body[0].platform.includes('One') || products[0].platform.includes('Series')) {
                platformElementFilter =
                    <FilterCheckBox param={'platform'} data={['One', 'Series']} json={filterJson} preview={'Платформа'}
                                    setJson={onSetFilter}/>
            }
        }
    } catch (e) {
    }

    let categoryElementFilter = (<div></div>)
    try {

        if (typeof products[0].category !== 'undefined') {
            if (products[0].category.includes('Старый') || products[0].category.includes('Новый')) {
                categoryElementFilter =
                    <FilterCheckBox param={'category'} data={['Старый аккаунт', 'Новый аккаунт']} json={filterJson}
                                    preview={'Вид активации'}
                                    setJson={onSetFilter}/>
            }
        }
    } catch (e) {
    }

    let languageElementFilter = (<div></div>)
    try {
        if (typeof products[0].body.languageSelector !== 'undefined') {
                console.log(123)
                languageElementFilter =  <FilterCheckBox param={'languageSelector'} data={['На русском языке', 'Русские субтитры (текст)', 'Без перевода']} json={filterJson}
                                    preview={'Язык'}
                                    setJson={onSetFilter}/>
        }
    } catch (e) {
    }

    let nav1El = (<div></div>)
    let nav2El = (<div></div>)
    let nav3El = (<div></div>)
    let nav4El = (<div></div>)
    if (listNumber > 1) {
        nav1El = (<div onClick={() => {
            list = 1;
            if (filterJson.platform.length>0 || filterJson.category.length>0 || filterJson.languageSelector.length>0){
                sendRequestOnDatabase({path: path, number: list, json:filterJson}, 'getList')
            }else{
                sendRequestOnDatabase({path: path, number: list}, 'getList')
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
            if (filterJson.platform.length>0 || filterJson.category.length>0|| filterJson.languageSelector.length>0){
                sendRequestOnDatabase({path: path, number: list, json:filterJson}, 'getList')
            }else{
                sendRequestOnDatabase({path: path, number: list}, 'getList')
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
            if (filterJson.platform.length>0 || filterJson.category.length>0|| filterJson.languageSelector.length>0){
                sendRequestOnDatabase({path: path, number: list, json:filterJson}, 'getList')
            }else{
                sendRequestOnDatabase({path: path, number: list}, 'getList')
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
            if (filterJson.platform.length>0 || filterJson.category.length>0|| filterJson.languageSelector.length>0){
                sendRequestOnDatabase({path: path, number: list, json:filterJson}, 'getList')
            }else{
                sendRequestOnDatabase({path: path, number: list}, 'getList')
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

    if (status === 1) {
        return (
            <div className={'list'} style={{display: 'flex', flexDirection: 'column'}}>
                <div className={'box-grid-panel'}>
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
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    {/*<div style={{}}>*/}
                    {/*    <div onClick={() => {*/}
                    {/*        if (filterHeight === oldFilterHeight) {*/}
                    {/*            setFilterHeight(0)*/}
                    {/*        } else {*/}
                    {/*            setFilterHeight(oldFilterHeight)*/}
                    {/*        }*/}
                    {/*    }} className={'text-element'}*/}
                    {/*         style={{marginLeft: '15px', fontSize: '18px', lineHeight: '20px'}}>Фильтры*/}
                    {/*    </div>*/}
                    {/*    <div style={{*/}
                    {/*        display: 'flex',*/}
                    {/*        marginTop: '7px',*/}
                    {/*        marginLeft: '10px',*/}
                    {/*        flexDirection: 'column',*/}
                    {/*        justifyContent: 'left',*/}
                    {/*        position: 'absolute',*/}
                    {/*        overflow: 'hidden',*/}
                    {/*        height: String(filterHeight) + 'px',*/}
                    {/*        width: String(window.innerWidth / 2) + 'px',*/}
                    {/*    }}>*/}
                    {/*        <div style={{*/}
                    {/*            border: '2px solid gray',*/}
                    {/*            borderRadius: '7px',*/}
                    {/*            height: 'max-content',*/}
                    {/*            background: '#171717',*/}
                    {/*            transitionProperty: 'height',*/}
                    {/*            transitionDuration: '0.3s',*/}
                    {/*        }}>*/}
                    {/*            <div style={{position: 'relative'}}>{languageElementFilter}</div>*/}
                    {/*            <div style={{position: 'relative'}}>{platformElementFilter}</div>*/}
                    {/*            <div style={{position: 'relative'}}>{categoryElementFilter}</div>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <div className={'text-element'} style={{
                        fontSize: '18px',
                        marginBottom: '5px',
                        marginRight: '15px',
                        lineHeight: '20px'
                    }}>
                        <div onClick={onSort}>{stpSort}</div>
                    </div>
                </div>
                <div className={'scroll-container-y'}
                     style={{
                         borderBottom: '2px solid #454545',
                         height: String(height - 130 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px'
                     }}>
                    <div className={'list-grid'}>
                        {products.map(item => {
                            let newItem = item.body
                            newItem.id = item.id
                            return (<ProductItem key={newItem.id} product={newItem} path={path}/>)
                        })}
                    </div>
                </div>
                <div style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: String(window.innerWidth) + 'px',
                    display: 'flex',
                    flexDirection: 'row',
                    marginTop: '10px'
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
        );
    } else if (status === 0) {
        if (filterJson.platform.length>0 || filterJson.category.length>0|| filterJson.languageSelector.length>0){
            sendRequestOnDatabase({path: path, number: 1, json:filterJson}, 'getList')
        }else{
            sendRequestOnDatabase({path: path, number: 1}, 'getList')
        }

        return (<div className={'pong-loader'} style={{
            border: '2px solid #8cdb8b',
            marginTop: String(window.innerHeight / 2 - 60) + 'px',
            marginLeft: String(window.innerWidth / 2 - 40) + 'px'
        }}></div>)
    } else if (status === 10) {
        return (
            <div className={'list'} style={{display: 'flex', flexDirection: 'column'}}>
                <div className={'box-grid-panel'}>
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
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    {/*<div style={{}}>*/}
                    {/*    <div onClick={() => {*/}
                    {/*        if (filterHeight === oldFilterHeight) {*/}
                    {/*            setFilterHeight(0)*/}
                    {/*        } else {*/}
                    {/*            setFilterHeight(oldFilterHeight)*/}
                    {/*        }*/}
                    {/*    }} className={'text-element'}*/}
                    {/*         style={{marginLeft: '15px', fontSize: '18px', lineHeight: '20px'}}>Фильтры*/}
                    {/*    </div>*/}
                    {/*    <div style={{*/}
                    {/*        display: 'flex',*/}
                    {/*        marginTop: '7px',*/}
                    {/*        marginLeft: '10px',*/}
                    {/*        flexDirection: 'column',*/}
                    {/*        justifyContent: 'left',*/}
                    {/*        position: 'absolute',*/}
                    {/*        overflow: 'hidden',*/}
                    {/*        height: String(filterHeight) + 'px',*/}
                    {/*        width: String(window.innerWidth / 2) + 'px',*/}
                    {/*    }}>*/}
                    {/*        <div style={{*/}
                    {/*            border: '2px solid gray',*/}
                    {/*            borderRadius: '7px',*/}
                    {/*            height: 'max-content',*/}
                    {/*            background: '#171717',*/}
                    {/*            transitionProperty: 'height',*/}
                    {/*            transitionDuration: '0.3s',*/}
                    {/*        }}>*/}
                    {/*            <div style={{position: 'relative'}}>{platformElementFilter}</div>*/}
                    {/*            <div style={{position: 'relative'}}>{categoryElementFilter}</div>*/}
                    {/*            <div style={{position: 'relative'}}>{languageElementFilter}</div>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <div className={'text-element'} style={{
                        fontSize: '18px',
                        marginBottom: '5px',
                        marginRight: '15px',
                        lineHeight: '20px'
                    }}>
                        <div onClick={onSort}>{stpSort}</div>
                    </div>
                </div>
                <div className={'scroll-container-y'}
                     style={{
                         borderBottom: '2px solid #454545',
                         height: String(height - 130 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px'
                     }}>
                    <div className={'pong-loader'} style={{
                        border: '2px solid #8cdb8b',
                        marginTop: String((window.innerHeight-200) / 2 - 60) + 'px',
                        marginLeft: String(window.innerWidth / 2 - 40) + 'px'
                    }}></div>
                </div>
                <div style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: String(window.innerWidth) + 'px',
                    display: 'flex',
                    flexDirection: 'row',
                    marginTop: '10px'
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
        );
    }

};

export default ProductList;