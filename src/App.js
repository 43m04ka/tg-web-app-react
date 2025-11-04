import './App.css';

import React, {useCallback, useEffect, useState} from "react";
import {useTelegram} from "./hooks/useTelegram";
import {Route, Routes, useNavigate} from "react-router-dom";
import ProductList from "./components/UI/pages/other/ProductList";
import MainPage from "./components/UI/MainPage";
import ErrorPage from "./components/UI/pages/other/ErrorPage";
import Search_old from "./components/UI/pages/Search/Search_old";
import Basket_old from "./components/UI/pages/Basket/Bascet_old/Basket_old";
import AdminPanel from "./components/UI/pages/AdminPanel/AdminPanel";
import Info from "./components/UI/pages/other/Info";
import ProductListSelector from "./components/UI/pages/other/ProductListSelector";
import History from "./components/UI/pages/other/History";
import Favorites from "./components/UI/pages/other/Favorites";
import Roulette from "./components/UI/pages/other/Roulette";
import AP_Authentication from "./components/UI/pages/AdminPanel/AP_Authentication";
import useGlobalData from "./hooks/useGlobalData";
import Product from "./components/UI/pages/Product/Product";


function App() {
    const {tg, user} = useTelegram();
    const navigate = useNavigate();

    const {
        pageId,
        pageList,
        updatePageList,
        catalogList,
        updateCatalogList,
        mainPageCards,
        updateMainPageCards,
        catalogStructureList,
        updateCatalogStructureList,
        updatePreviewFavoriteData,
        updatePreviewBasketData,
        updateCounterBasket
    } = useGlobalData();


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
        } catch (e) {
        }
        tg.ready();
    }, [])

    useEffect(() => {
        if (pageList === null) {
            updatePageList()
        }
        if (catalogStructureList === null) {
            updateCatalogStructureList()
        }
        if (mainPageCards === null) {
            updateMainPageCards()
        }
        if (catalogList === null) {
            updateCatalogList()
        }
        updatePreviewFavoriteData(user.id)
        updatePreviewBasketData(user.id)
        updateCounterBasket(catalogList, pageId)
    }, [])


    if (pageList !== null) {
        if (window.location.pathname === '/') {
            navigate(pageList[0]['link'])
        }
        return (
            <div className="App">
                <Routes>
                    {pageList.map((page) => (<Route path={page['link'] + '/*'} key={page['id']} element={<MainPage page={page}/>}/>))}
                    <Route path={'favorites'} element={<Favorites/>}/>
                    <Route path={'/catalog/*'} element={<ProductList height={size}/>}/>
                    <Route path={'/card/*'} element={<Product/>}/>
                    <Route path={'/choice-catalog/*'} element={<ProductListSelector/>}/>
                    <Route path={'admin-panel/*'} element={<AdminPanel/>}/>
                    <Route path={'admin'} element={<AP_Authentication/>}/>
                    <Route path={'/history'} element={<History/>}/>
                    <Route path="*" element={<ErrorPage/>}/>
                </Routes>
            </div>
        );
    } else {
        return (<div className={'plup-loader'} style={{
            marginTop: String(size / 2 - 50) + 'px',
            marginLeft: String(window.innerWidth / 2 - 50) + 'px'
        }}></div>);
    }
}

export default App;
