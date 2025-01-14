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
    const [dataCards, setDataCards] = useState(null)
    const [basketData, setBasketData] = useState(null);
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
                console.log(prom)
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

                await inputDataCards.map(async cardOld => {
                    let card = cardOld.body
                    card.id = cardOld.id

                    const cardTab = card.tab
                    const cardCategory = card.tabCategoryPath

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
        tg.disableVerticalSwipes();
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


    if (status === 2) {
        return (
            <div className="App">
                <div style={{height: String(tg?.contentSafeAreaInset.top) + 'px'}}></div>
                <div style={{height: String(tg?.safeAreaInset.top) + 'px'}}></div>
                <Routes>
                    {mainData.map(platform => (
                        <Route path={'home' + platform.id}
                               element={<Home main_data={platform} page={platform.id} width={window.innerWidth}
                                              height={size} setBasket={setBasketData}/>}/>
                    ))}

                    {dataCards.map(item =>
                        (<Route path={'card/' + item.id} key={item.id}
                                element={<CardProduct mainData={item} height={size}
                                                      basketData={basketData}/>}/>)
                    )
                    }
                    {mainData.map(platform => (
                        platform.body[1].map(category => (
                            <Route path={'home/' + category.path} key={category.id}
                                   element={<ProductList main_data={category} page={platform.id} height={size}
                                                         path={category.path} setData={setDataCards} setStatusApp={setStatus}/>}/>
                        ))
                    ))}

                    {mainData.map(platform => (
                        platform.body[0].map(category => (
                            <Route path={category.path} key={category.id}
                                   element={<ProductListSelector main_data={category} page={platform.id} height={size}
                                                                 basketData={basketData}/>}/>
                        ))
                    ))}
                    <Route path={'basket0'} element={<Basket height={size} number={0}/>}/>
                    <Route path={'basket1'} element={<Basket height={size} number={1}/>}/>
                    <Route path={'basket2'} element={<Basket height={size} number={2}/>}/>
                    {mainData.map(platform => (
                        <Route path={'search' + String(platform.id)}
                               element={<Search data={platform} height={size}/>}/>
                    ))}
                    <Route path={'admin'} element={<AdminPanel/>}/>
                    <Route path={'info'} element={<Info/>}/>
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
        setStatus(1)
    }
}

export default App;
