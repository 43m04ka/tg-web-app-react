import './App.css';

import React, {useCallback, useEffect, useState} from "react";
import {useTelegram} from "./hooks/useTelegram";
import {Route, Routes, useNavigate} from "react-router-dom";
import ProductList from "./components/UI/ProductList";
import MainPage from "./components/UI/pages/Main/MainPage";
import ErrorPage from "./components/UI/ErrorPage";
import Search from "./components/UI/Search";
import Basket from "./components/UI/pages/Basket/Basket";
import AdminPanel from "./components/UI/pages/AdminPanel/AdminPanel";
import Info from "./components/UI/Info";
import ProductListSelector from "./components/UI/ProductListSelector";
import History from "./components/UI/History";
import Favorites from "./components/UI/Favorites";
import Roulette from "./components/UI/Roulette";
import AP_Authentication from "./components/UI/pages/AdminPanel/AP_Authentication";
import useGlobalData from "./hooks/useGlobalData";
import Product from "./components/UI/pages/Product/Product";


function App() {
    const {tg, user} = useTelegram();
    const navigate = useNavigate();

    const {pageList, updatePageList, updateCatalogList, updateMainPageCards, updateCatalogStructureList, updatePreviewFavoriteData, updatePreviewBasketData} = useGlobalData();

    const [size, setSize] = React.useState(window.innerHeight);

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
            tg.requestFullscreen();
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
                    {pageList.map((page) => (<Route path={page['link']} key={page['id']} element={<MainPage pageList = {pageList} height={size}/>} />))}

                    {pageList.map((page, index)=>(<Route path={'basket-'+page.id} element={<Basket height={size} number={index}/>}/>))}
                    {pageList.map((page)=>(<Route path={'search-'+page.id} element={<Search height={size}/>}/>))}

                    <Route path={'favorites'} element={<Favorites/>}/>
                    <Route path={'/catalog/*'} element={<ProductList height={size}/>}/>
                    <Route path={'/card/*'} element={<Product/>}/>
                    <Route path={'/choice-catalog/*'} element={<ProductListSelector/>}/>
                    <Route path={'admin-panel/*'} element={<AdminPanel/>}/>
                    <Route path={'admin'} element={<AP_Authentication/>}/>
                    <Route path={'info'} element={<Info/>}/>
                    <Route path={'/history/*'} element={<History/>}/>
                    <Route path={'freegame'} element={<Roulette/>}/>
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
