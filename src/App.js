//import logo from './logo.svg';
import './App.css';
import React, {useCallback, useEffect, useState} from "react";
import {useTelegram} from "./hooks/useTelegram";
import {Route, Routes} from "react-router-dom";
import ProductList from "./components/UI/ProductList";
import Home from "./components/UI/Home";
import ErrorPage from "./components/UI/ErrorPage";
import Search from "./components/UI/Search";
import CardProduct from "./components/UI/CardProduct";
import Basket from "./components/UI/Basket";
import AdminPanel from "./components/UI/AdminPanel";
import Info from "./components/UI/Info";
import ProductListSelector from "./components/UI/ProductListSelector";
import History from "./components/UI/History";
import Order from "./components/UI/Order";
import Cassa from "./components/UI/Cassa";

let basketDataGlob = null

function App() {
    const {tg, user} = useTelegram();
    const [size, setSize] = React.useState(window.innerHeight);
    const [mainData, setMainData] = useState([
        {id: 0, page: 'playstation', body: [[], []]}, {
            id: 1,
            page: 'xbox',
            body: [[], []]
        }, {id: 2, page: 'service', body: [[], []]}]);
    const [status, setStatus] = useState(0);
    const [dataCards, setDataCards] = useState([])
    const [dataCardsDop, setDataCardsDop] = useState([])
    const [basketData, setBasketData] = useState([]);
    const [historyData, setHistoryData] = React.useState([]);
    let dataRequestDatabase = {
        method: 'getPreview',
        data: []
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
                const promise = prom
                const inputDataCards = promise.cards;
                setDataCards(inputDataCards)
                let resultData = promise.structure;
                let count = 0
                resultData[0].body[1].map(el => {
                    resultData[0].body[1][count].body = []
                    count++
                })
                count = 0
                resultData[0].body[0].map(el => {
                    resultData[0].body[0][count].body = []
                    count++
                })
                count = 0
                resultData[1].body[1].map(el => {
                    resultData[1].body[1][count].body = []
                    count++
                })
                count = 0
                resultData[1].body[0].map(el => {
                    resultData[1].body[0][count].body = []
                    count++
                })
                count = 0
                resultData[2].body[1].map(el => {
                    resultData[2].body[1][count].body = []
                    count++
                })
                count = 0
                resultData[2].body[0].map(el => {
                    resultData[2].body[0][count].body = []
                    count++
                })

                await inputDataCards.map(async card => {

                    const cardTab = card.body.tab
                    const cardCategory = card.body.tabCategoryPath

                    let count = 0
                    await resultData[cardTab].body['1'].map(async category => {
                        if (category.path.replace(/\//g, "") === cardCategory) {
                            resultData[cardTab].body['1'][count].body = [...resultData[cardTab].body['1'][count].body, ...[card]]
                        }
                        count += 1;
                    })

                    count = 0
                    await resultData[cardTab].body['0'].map(async category => {
                        if (category.path.replace(/\//g, "") === cardCategory) {
                            resultData[cardTab].body['0'][count].body = [...resultData[cardTab].body['0'][count].body, ...[card]]
                        }
                        count += 1;
                    })

                })
                await setMainData(resultData)
                await setStatus(2)
                console.log(resultData)

            })
        })
    }, [dataRequestDatabase])

    const sendData = {
        method: 'get',
        user: user,
    }

    const onGetData = useCallback(() => {
        try {
            fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/basket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sendData)
            }).then(r => {
                let Promise = r.json()
                Promise.then(r => {
                    if(typeof r.body !== 'undefined') {
                        setBasketData(r.body);
                    }
                })
            })
        }catch (e) {
            
        }
    }, [sendData])

    const resizeHandler = () => {
        setSize(window.innerHeight);
    };

    React.useEffect(() => {
        window.addEventListener("resize", resizeHandler);
        resizeHandler();
        return () => {
            window.removeEventListener("resize", resizeHandler);
        };
    }, []);

    useEffect(() => {
        try {
            tg.disableVerticalSwipes();
            tg.lockOrientation();
        }catch (e)
        {console.log(e)}

        try {
            if (tg.platform !== 'tdesktop' && tg.platform !== 'macos') {
                tg.requestFullscreen()
            }
            tg.expand()
        } catch (err) {
            console.log(err)
        }
        tg.ready();
    }, [])

    const sendDataOrders = {
        method: 'get',
        user: user,
    }

    const onSendDataOrders = useCallback(() => {
        try {
            fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sendDataOrders)
            }).then(r => {
                let Promise = r.json()
                Promise.then(prom => {
                    if(typeof prom.body !== 'undefined') {
                        setHistoryData(prom.body)
                    }
                })
            })
        }catch (e) {
            
        }
    }, [sendDataOrders])


    if (status === 2) {
        return (
            <div className="App">
                <div style={{height: String(tg?.contentSafeAreaInset.top) + 'px'}}></div>
                <div style={{height: String(tg?.safeAreaInset.top) + 'px'}}></div>
                <Routes>
                    {mainData.map(platform => (
                        <Route path={'home' + platform.id} key={platform.id}
                               element={<Home main_data={platform} page={platform.id} width={window.innerWidth}
                                              height={size} setBasket={setBasketData}/>}/>
                    ))}

                    {dataCards.map(item =>
                        (<Route path={'card/' + item.id} key={item.id}
                                element={<CardProduct mainData={item} basketData={basketData}
                                                      setDataDop={setDataCardsDop} onGetData={onGetData}/>}/>)
                    )
                    }
                    {dataCardsDop.map(item =>
                        (<Route path={'card/' + item.id} key={item.id}
                                element={<CardProduct mainData={item} basketData={basketData}
                                                      setDataDop={setDataCardsDop} dataDop={dataCardsDop}
                                                      onGetData={onGetData}/>}/>)
                    )
                    }
                    {basketData.map(item =>
                        (<Route path={'card/' + item.id} key={item.id}
                                element={<CardProduct mainData={item} basketData={basketData}
                                                      setDataDop={setDataCardsDop} dataDop={dataCardsDop}
                                                      onGetData={onGetData}/>}/>)
                    )
                    }
                    {mainData.map(platform => (
                        platform.body[1].map(category => (
                            <Route path={'home/' + category.path} key={category.id}
                                   element={<ProductList main_data={category} page={platform.id} height={size}
                                                         path={category.path} setDataDop={setDataCardsDop}/>}/>
                        ))
                    ))}

                    {mainData.map(platform => (
                        platform.body[0].map(category => (
                            <Route path={category.path} key={category.id}
                                   element={<ProductListSelector main_data={category} page={platform.id} height={size}
                                                                 basketData={basketData}/>}/>
                        ))
                    ))}
                    <Route path={'basket0'} element={<Basket height={size} number={0} updateOrders={onSendDataOrders}/>}/>
                    <Route path={'basket1'} element={<Basket height={size} number={1} updateOrders={onSendDataOrders}/>}/>
                    <Route path={'basket2'} element={<Basket height={size} number={2} updateOrders={onSendDataOrders}/>}/>
                    {mainData.map(platform => (
                        <Route path={'search' + String(platform.id)} key={platform.id}
                               element={<Search height={size} setData={setDataCards} setStatusApp={setStatus}
                                                page={platform.id}/>}/>
                    ))}
                    <Route path={'admin'} element={<AdminPanel/>}/>
                    <Route path={'info'} element={<Info/>}/>
                    <Route path={'history'} element={<History historyData={historyData}/>}/>
                    <Route path={'cassa'} element={<Cassa/>}/>
                    {historyData.map(order=>(
                        <Route path={'history/'+String(order.id)} key={order.id} element={<Order data={order}/>}/>
                    ))}
                    <Route path="*" element={<ErrorPage/>}/>
                </Routes>

            </div>
        );
    } else if (status === 1) {

        return (<div className={'pong-loader'} style={{
            border: '2px solid #8cdb8b',
            marginTop: String(size / 2 - 60) + 'px',
            marginLeft: String(window.innerWidth / 2 - 40) + 'px'
        }}></div>);
    } else if (status === 0) {
        sendRequestDatabase()
        onGetData()
        onSendDataOrders()
        setStatus(1)
    }
}

export default App;
