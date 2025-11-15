import React, {useEffect, useState} from 'react';
import '../styles/style.css';
import {useTelegram} from "../../hooks/useTelegram";
import useGlobalData from "../../hooks/useGlobalData";
import style from './MainPage.module.scss'
import NavigationBar from "./pages/NavigationBar/NavigationBar";
import CatalogListBody from "./pages/MainScreen/CatalogList/CatalogListBody";
import CatalogListHead from "./pages/MainScreen/CatalogList/CatalogListHead";
import {Route, Routes, useNavigate} from "react-router-dom";
import Search from "./pages/Search/Search";
import Basket from "./pages/Basket/Basket";
import MoreInfo from "./pages/MoreInfo/MoreInfo";
import SelectPlatform from "./pages/SelectPlatform/SelectPlatform";


const MainPage = ({page}) => {
    const {tg} = useTelegram();
    const [heightTab, setHeightTab] = useState(0);
    const [zIndexTab, setZIndexTab] = useState(-10);
    const [height, setHeight] = useState(0);
    const {pageId, setPageId} = useGlobalData()


    useEffect(() => {
        tg.BackButton.hide();
        if (pageId === -1) {
            setPageId(page.id)
        }
    }, [])

    useEffect(() => {
        if (window.innerHeight > height) {
            setHeight(window.innerHeight)
        }
    }, [window.innerHeight])


    return (<div className={style['mainDivision']} style={{height: String(height) + 'px'}}>
        <div style={{zIndex: 100, height: String(height) + 'px'}}>
            <div>
                <CatalogListHead/>
                <CatalogListBody/>
                <Routes>
                    <Route path="/search" element={<Search/>}/>
                    <Route path="/basket" element={<Basket/>}/>
                    <Route path="/selectPlatform" element={<SelectPlatform/>}/>
                    <Route path="/more" element={<MoreInfo/>}/>
                </Routes>
            </div>
        </div>
        <div style={{zIndex: zIndexTab, height: String(height) + 'px'}}>
            <div style={{height: heightTab, zIndex: zIndexTab}}>
                <Routes>
                    <Route path="/search" element={<Search/>}/>
                    <Route path="/basket" element={<Basket/>}/>
                    <Route path="/selectPlatform" element={<SelectPlatform/>}/>
                    <Route path="/more" element={<MoreInfo/>}/>
                </Routes>
            </div>
        </div>
        <div style={{top: String(height) + 'px'}}>
            <NavigationBar setZIndexTab={setZIndexTab} zIndexTab={zIndexTab} heightTab={heightTab}
                           setHeightTab={setHeightTab} height={height}/>
        </div>

        {/*<div style={{height: String(tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom) + 'px', overflow:'hidden', background:'#222222', zIndex:'-100'}}><div style={{height: '100vh'}}/></div>*/}
    </div>);
};

export default MainPage;