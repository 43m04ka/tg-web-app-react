import './App.css';

import React, {useCallback, useEffect, useState} from "react";
import {useTelegram} from "./hooks/useTelegram";
import {Route, Routes, useNavigate} from "react-router-dom";
import ProductList from "./components/UI/ProductList";
import MainPage from "./components/UI/pages/Main/MainPage";
import ErrorPage from "./components/UI/ErrorPage";
import Search from "./components/UI/Search";
import Basket from "./components/UI/Basket";
import AdminPanel from "./components/UI/pages/AdminPanel/AdminPanel";
import Info from "./components/UI/Info";
import ProductListSelector from "./components/UI/ProductListSelector";
import History from "./components/UI/History";
import Order from "./components/UI/Order";
import Favorites from "./components/UI/Favorites";
import Roulette from "./components/UI/Roulette";
import AP_Authentication from "./components/UI/pages/AdminPanel/AP_Authentication";
import useGlobalData from "./hooks/useGlobalData";
import CardProduct from "./components/UI/CardProduct";


function App() {
    const {tg, user} = useTelegram();
    const navigate = useNavigate();

    const {pageList, updatePageList, updateCatalogList, updateMainPageCards, updateCatalogStructureList, updatePreviewFavoriteData, updatePreviewBasketData} = useGlobalData();

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

    const resizeHandler = () => {
        setSize(window.innerHeight);
    };

    useEffect(() => {
        window.addEventListener("resize", resizeHandler);
        resizeHandler();
        return () => {
            window.removeEventListener("resize", resizeHandler);
        };
    }, [])

    useEffect(() => {
        try {
            tg.disableVerticalSwipes();
            tg.lockOrientation();
        }catch (e) {console.log(e)}
        tg.ready();
    }, [])

    useEffect(()=>{
        updatePageList()
        updateCatalogStructureList()
        updateMainPageCards()
        updateCatalogList()
        updatePreviewFavoriteData(user.id)
        updatePreviewBasketData(user.id)
    }, [])


    if (pageList !== null)  {
        if(window.location.pathname === '/'){
            navigate(pageList[0]['link'])
        }
        return (
            <div className="App">
                <div style={{height: String(tg?.contentSafeAreaInset.top) + 'px'}}></div>
                <div style={{height: String(tg?.safeAreaInset.top) + 'px'}}></div>
                <Routes>
                    {pageList.map((page) => (<Route path={page['link']} key={page['id']} element={<MainPage pageList = {pageList} cardList={dataCards} setDataCardsDop={setDataCardsDop}/>} />))}

                    {pageList.map((page, index)=>(<Route path={'basket-'+page.id} element={<Basket height={size} number={index}/>}/>))}

                    <Route path={'favorites'} element={<Favorites/>}/>
                    <Route path={'/catalog/*'} element={<ProductList setDataDop={setDataCardsDop}/>}/>
                    <Route path={'/card/*'} element={<CardProduct/>}/>
                    <Route path={'/choice-catalog/*'} element={<ProductListSelector basketData={basketData}/>}/>

                    {mainData.map(platform => (
                        <Route path={'search' + String(platform.id)} key={platform.id}
                               element={<Search height={size} setData={setDataCardsDop} setStatusApp={setStatus}
                                                page={platform.id}/>}/>
                    ))}
                    <Route path={'admin-panel/*'} element={<AdminPanel/>}/>
                    <Route path={'admin'} element={<AP_Authentication/>}/>
                    <Route path={'info'} element={<Info/>}/>
                    <Route path={'history'} element={<History/>}/>
                    <Route path={'freegame'} element={<Roulette/>}/>
                    {historyData.map(order=>(
                        <Route path={'history/'+String(order.id)} key={order.id} element={<Order data={order}/>}/>
                    ))}
                    <Route path="*" element={<ErrorPage/>}/>
                </Routes>

            </div>
        );
    } else{
        return (<div className={'plup-loader'} style={{
            marginTop: String(size / 2 - 50) + 'px',
            marginLeft: String(window.innerWidth / 2 - 50) + 'px'
        }}></div>);
    }
}

export default App;
