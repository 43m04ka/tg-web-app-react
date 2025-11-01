import React, {useEffect, useState} from 'react';
import '../styles/style.css';
import {useTelegram} from "../../hooks/useTelegram";
import useGlobalData from "../../hooks/useGlobalData";
import style from './MainPage.module.scss'
import NavigationBar from "./pages/NavigationBar/NavigationBar";
import CatalogListBody from "./pages/MainScreen/CatalogList/CatalogListBody";
import CatalogListHead from "./pages/MainScreen/CatalogList/CatalogListHead";
import {Route, Routes} from "react-router-dom";
import Search from "./pages/Search/Search";
import Basket from "./pages/Basket/Basket";
import Info from "./pages/other/Info";
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

    useEffect(()=>{
        setHeight(window.innerHeight - window.screen.availHeight)
    }, [window.screen.availHeight, window.innerHeight])


    return (<div className={style['mainDivision']} style={{height:String(window.screen.availHeight) + 'px'}}>
        <div style={{zIndex: 0}}>
            <div>
                <CatalogListHead/>
                <CatalogListBody/>
            </div>
        </div>
        <div style={{zIndex: zIndexTab}}>
            <div style={{height: heightTab, bottom: String(height) + 'px', zIndex: zIndexTab}}>
                <Routes>
                    <Route path="/search" element={<Search/>}/>
                    <Route path="/basket" element={<Basket/>}/>
                    <Route path="/selectPlatform" element={<SelectPlatform/>}/>
                    <Route path="/more" element={<Info/>}/>
                </Routes>
            </div>
        </div>
        <div style={{bottom: String(height + window.screen.availWidth * 0.03) + 'px'}}>
            <NavigationBar setZIndexTab={setZIndexTab} zIndexTab={zIndexTab} heightTab={heightTab}
                           setHeightTab={setHeightTab}/>
        </div>

        {/*<div style={{height: String(tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom) + 'px', overflow:'hidden', background:'#222222', zIndex:'-100'}}><div style={{height: '100vh'}}/></div>*/}
    </div>);
};

export default MainPage;