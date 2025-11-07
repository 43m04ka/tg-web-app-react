import './App.css';

import React, {useCallback, useEffect, useState} from "react";
import {useTelegram} from "./hooks/useTelegram";
import {Route, Routes, useNavigate} from "react-router-dom";
import ProductList from "./components/UI/pages/other/ProductList";
import MainPage from "./components/UI/MainPage";
import ErrorPage from "./components/UI/pages/other/ErrorPage";
import AdminPanel from "./components/UI/pages/AdminPanel/AdminPanel";
import ProductListSelector from "./components/UI/pages/other/ProductListSelector";
import History from "./components/UI/pages/other/History";
import Favorites from "./components/UI/pages/other/Favorites";
import AP_Authentication from "./components/UI/pages/AdminPanel/AP_Authentication";
import useGlobalData from "./hooks/useGlobalData";
import Product from "./components/UI/pages/Product/Product";
import style from './App.module.scss'


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
        updateBasket
    } = useGlobalData();


    const [size, setSize] = React.useState(window.innerHeight);
    const [isLoaded, setIsLoaded] = React.useState(true);

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
        setTimeout(()=>{
            updatePageList()
        }, 100)
        updateCatalogStructureList()
        updateMainPageCards()
        updateCatalogList()
        updatePreviewFavoriteData(user.id)
    }, [])

    if (!isLoaded) {
        if (window.location.pathname === '/') {
            navigate(pageList[0]['link'])
        }
        return (<div className="App">
            <Routes>
                {pageList.map((page) => (
                    <Route path={page['link'] + '/*'} key={page['id']} element={<MainPage page={page}/>}/>))}
                <Route path={'favorites'} element={<Favorites/>}/>
                <Route path={'/catalog/*'} element={<ProductList height={size}/>}/>
                <Route path={'/card/*'} element={<Product/>}/>
                <Route path={'/choice-catalog/*'} element={<ProductListSelector/>}/>
                <Route path={'admin-panel/*'} element={<AdminPanel/>}/>
                <Route path={'admin'} element={<AP_Authentication/>}/>
                <Route path={'/history'} element={<History/>}/>
                <Route path="*" element={<ErrorPage/>}/>
            </Routes>
        </div>);
    } else {
        return (<div className={style["container"]}>
            <div className={style['loader']}>
                <div className={style['box']}>
                    <div className={style['logo']}>
                        <div/>
                    </div>
                </div>
                <div className={style['box']}></div>
                <div className={style['box']}></div>
                <div className={style['box']}></div>
                <div className={style['box']}></div>
            </div>
            <div className={style['fillContainer']}>
                <div style={{scale: (catalogList !== null && pageList !== null && mainPageCards !== null ? '13' : '0')}}/>
                {catalogList !== null && pageList !== null && mainPageCards !== null ? setTimeout(()=>setIsLoaded(false), 200) : ''}
            </div>
        </div>);
    }
}

export default App;
