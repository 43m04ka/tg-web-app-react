//import logo from './logo.svg';
import './App.css';

import React, {useCallback, useEffect, useState} from "react";
import {useTelegram} from "./hooks/useTelegram";
import {Route, Routes, useNavigate} from "react-router-dom";
import ProductList from "./components/UI/ProductList";
import MainPage from "./components/UI/main_page/MainPage";
import ErrorPage from "./components/UI/ErrorPage";
import Search from "./components/UI/Search";
import CardProduct from "./components/UI/CardProduct";
import Basket from "./components/UI/Basket";
import AdminPanel from "./components/UI/admin_panel/AdminPanel";
import Info from "./components/UI/Info";
import ProductListSelector from "./components/UI/ProductListSelector";
import History from "./components/UI/History";
import Order from "./components/UI/Order";
import Favorites from "./components/UI/Favorites";
import Roulette from "./components/UI/Roulette";
import AP_Authentication from "./components/UI/admin_panel/AP_Authentication";
import {useServer} from "./hooks/useServer";

function App() {
    const {tg, user} = useTelegram();
    const {getPages, getCatalogs} = useServer();
    const navigate = useNavigate();

    const [size, setSize] = React.useState(window.innerHeight);
    const [pageList, setPageList] = React.useState(null);
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
    const [favoriteData, setFavoriteData] = useState([])
    const [historyData, setHistoryData] = React.useState([]);


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

    const onGetDataF = useCallback(() => {
        try {
            fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sendData)
            }).then(r => {
                let Promise = r.json()
                Promise.then(r => {
                    if(typeof r.body !== 'undefined') {
                        setFavoriteData(r.body);
                    }
                })
            })
        }catch (e) {

        }
    }, [sendData])



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


    if (pageList !== null)  {
        if(window.location.pathname === '/'){
            navigate(pageList[0]['link'])
        }
        return (
            <div className="App">
                <div style={{height: String(tg?.contentSafeAreaInset.top) + 'px'}}></div>
                <div style={{height: String(tg?.safeAreaInset.top) + 'px'}}></div>
                <Routes>
                    {pageList.map((page) => (<Route path={page['link']} key={page['id']} element={<MainPage pageList = {pageList} />} />))}

                    {dataCards.map(item =>
                        (<Route path={'card/' + item.id} key={item.id}
                                element={<CardProduct mainData={item} basketData={basketData}
                                                      favoriteData = {favoriteData}
                                                      setDataDop={setDataCardsDop} onGetData={onGetData}
                                                      onGetDataF={onGetDataF}/>}/>)
                    )
                    }
                    {dataCardsDop.map(item =>
                        (<Route path={'card/' + item.id} key={item.id}
                                element={<CardProduct mainData={item} basketData={basketData}
                                                      favoriteData = {favoriteData}
                                                      setDataDop={setDataCardsDop} dataDop={dataCardsDop}
                                                      onGetData={onGetData} onGetDataF={onGetDataF}/>}/>)
                    )
                    }
                    {basketData.map(item =>
                        (<Route path={'card/' + item.id} key={item.id}
                                element={<CardProduct mainData={item} basketData={basketData}
                                                      favoriteData = {favoriteData}
                                                      setDataDop={setDataCardsDop} dataDop={dataCardsDop}
                                                      onGetData={onGetData} onGetDataF={onGetDataF}/>}/>)
                    )
                    }
                    {favoriteData.map(item =>
                        (<Route path={'card/' + item.id} key={item.id}
                                element={<CardProduct mainData={item} basketData={basketData}
                                                      favoriteData = {favoriteData}
                                                      setDataDop={setDataCardsDop} dataDop={dataCardsDop}
                                                      onGetData={onGetData} onGetDataF={onGetDataF}/>}/>)
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

                    <Route path={'favorites'} element={<Favorites height={size}/>}/>

                    {mainData.map(platform => (
                        <Route path={'search' + String(platform.id)} key={platform.id}
                               element={<Search height={size} setData={setDataCardsDop} setStatusApp={setStatus}
                                                page={platform.id}/>}/>
                    ))}
                    <Route path={'admin-panel'} element={<AdminPanel/>}/>
                    <Route path={'admin'} element={<AP_Authentication/>}/>
                    <Route path={'info'} element={<Info/>}/>
                    <Route path={'history'} element={<History historyData={historyData}/>}/>
                    <Route path={'freegame'} element={<Roulette/>}/>
                    {historyData.map(order=>(
                        <Route path={'history/'+String(order.id)} key={order.id} element={<Order data={order}/>}/>
                    ))}
                    <Route path="*" element={<ErrorPage/>}/>
                </Routes>

            </div>
        );
    } else{
        onGetData()
        onGetDataF()
        getPages(setPageList).then()
        onSendDataOrders()
        return (<div className={'plup-loader'} style={{
            marginTop: String(size / 2 - 50) + 'px',
            marginLeft: String(window.innerWidth / 2 - 50) + 'px'
        }}></div>);
    }
}

export default App;
