import './App.css';

import React, {useEffect} from "react";
import {useTelegram} from "./hooks/useTelegram";
import {Route, Routes, useNavigate} from "react-router-dom";
import Catalog from "./components/UI/pages/Catalog/Catalog";
import MainPage from "./components/UI/MainPage";
import ErrorPage from "./components/UI/pages/other/ErrorPage";
import AdminPanel from "./components/UI/pages/AdminPanel/AdminPanel";
import History from "./components/UI/pages/other/History";
import Favorites from "./components/UI/pages/other/Favorites";
import AP_Authentication from "./components/UI/pages/AdminPanel/AP_Authentication";
import useGlobalData from "./hooks/useGlobalData";
import Product from "./components/UI/pages/Product/Product";
import style from './App.module.scss'

const initialState = window.__INITIAL_DATA__;

function App() {
    const {tg, user} = useTelegram();
    const navigate = useNavigate();

    const {
        pageList,
        pageId,
        updatePageList,
        catalogList,
        updateCatalogList,
        mainPageCards,
        updateMainPageCards,
        updateCatalogStructureList,
        updatePreviewFavoriteData,
        updateBasket,
        setPageId
    } = useGlobalData();


    const [isLoaded, setIsLoaded] = React.useState(true);

    useEffect(() => {
        try {
            tg.disableVerticalSwipes();
            tg.lockOrientation();
            tg.isClosingConfirmationEnabled = true;
            if (window.screen.availHeight > window.screen.availWidth) {
                tg.requestFullscreen();
            }
        } catch (e) {
        }
        tg.ready();
    }, [])

    useEffect(() => {
        updatePageList(initialState.pages)
        updateCatalogStructureList(initialState.structureBlocks)
        updateMainPageCards(initialState.mainPageProducts)
        updateCatalogList(initialState.allCatalogs)
        if (typeof user !== 'undefined') {
            updatePreviewFavoriteData(user.id)
        }
    }, [])

    useEffect(() => {
        if (catalogList !== null) {
            updateBasket(catalogList, pageId)
        }
    }, [pageId])

    if (catalogList !== null && pageList !== null && mainPageCards !== null && isLoaded) {
        setTimeout(() => {
            setPageId(pageList[0].id)
            setIsLoaded(false)
        }, 150)
    }

    if (!isLoaded) {
        if (window.location.pathname === '/') {
            if (typeof tg.initDataUnsafe.start_param !== 'undefined') {
                navigate(pageList[0]['link'])
                navigate('/card/' + String(tg.initDataUnsafe.start_param))
            } else {
                navigate(pageList[0]['link'])
            }
        }
        return (<div className={style['App']}>
            <Routes>
                {pageList.map((page) => (
                    <Route path={page['link'] + '/*'} key={page['id']} element={<MainPage page={page}/>}/>))}
                <Route path={'favorites'} element={<Favorites/>}/>
                <Route path={'/catalog/*'} element={<Catalog/>}/>
                <Route path={'/card/*'} element={<Product/>}/>
                <Route path={'/choice-catalog/*'} element={<Product/>}/>
                <Route path={'admin-panel/*'} element={<AdminPanel/>}/>
                <Route path={'admin'} element={<AP_Authentication/>}/>
                <Route path={'/history'} element={<History/>}/>
                <Route path="*" element={<ErrorPage/>}/>
            </Routes>
        </div>);
    } else {
        return (<div className={style["container"]}>
            <div className={style['fillContainer']}>
                <div
                    style={{scale: (catalogList !== null && pageList !== null && mainPageCards !== null ? '12' : '0')}}/>
            </div>
        </div>);
    }
}

export default App;
