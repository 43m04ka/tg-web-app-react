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
import SelectPlatform from "./pages/MainScreen/SelectPlatform/SelectPlatform";

const MainPage = ({page}) => {
    const {tg} = useTelegram();
    const [heightTab, setHeightTab] = useState(0);
    const [zIndexTab, setZIndexTab] = useState(-10);
    const [height, setHeight] = useState(window.screen.availHeight);
    const {pageId, setPageId} = useGlobalData()


    useEffect(() => {
        tg.BackButton.hide();
        if (pageId === -1) {
            setPageId(page.id)
        }
    }, [])

    useEffect(()=>{
        setHeight(window.screen.availHeight)
    }, [window.screen.availHeight])


    return (<div className={style['mainDivision']} style={{height:String(window.innerHeight) + 'px'}}>
        <div>
            <div>
                <CatalogListHead/>
                <CatalogListBody/>
            </div>


        </div>
        <div style={{zIndex: zIndexTab}}>
            <div style={{height: heightTab, bottom: String( window.innerHeight - height) + 'px'}}>
                <Routes>
                    <Route path="/search" element={<Search/>}/>
                    <Route path="/basket" element={<Basket/>}/>
                    <Route path="/selectPlatform" element={<SelectPlatform/>}/>
                    <Route path="/more" element={<Info/>}/>
                </Routes>
            </div>
        </div>
        <NavigationBar setZIndexTab={setZIndexTab} zIndexTab={zIndexTab} heightTab={heightTab}
                       setHeightTab={setHeightTab} setHeight={setHeight}/>
        {/*<div style={{height: String(tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom) + 'px', overflow:'hidden', background:'#222222', zIndex:'-100'}}><div style={{height: '100vh'}}/></div>*/}
    </div>);
};

export default MainPage;