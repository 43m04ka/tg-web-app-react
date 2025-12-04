import React, {useEffect, useRef, useState} from 'react';
import '../styles/style.css';
import {useTelegram} from "../../hooks/useTelegram";
import useGlobalData from "../../hooks/useGlobalData";
import style from './MainPage.module.scss'
import NavigationBar from "./pages/NavigationBar/NavigationBar";
import CatalogListBody from "./pages/MainScreen/CatalogListBody";
import CatalogListHead from "./pages/MainScreen/CatalogListHead";
import {Route, Routes, useNavigate} from "react-router-dom";
import Search from "./pages/Search/Search";
import Basket from "./pages/Basket/Basket";
import MoreInfo from "./pages/MoreInfo/MoreInfo";
import SelectPlatform from "./pages/SelectPlatform/SelectPlatform";

let lastScroll = 0

const MainPage = ({page}) => {
    const {tg} = useTelegram();
    const [opacityTab, setOpacityTab] = useState(0);
    const [zIndexTab, setZIndexTab] = useState(-10);
    const [barIsVisible, setBarIsVisible] = useState(true);
    const scrollRef = useRef(null);
    const {pageId, setPageId} = useGlobalData()


    useEffect(() => {
        tg.BackButton.hide();
        if (pageId === -1) {
            setPageId(page.id)
        }
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: lastScroll, behavior: "instant",
            });
        }
    }, [])

    useEffect(()=>{
        setBarIsVisible(window.innerHeight >= window.screen.availHeight * 0.8)
    }, [window.innerHeight , window.screen.availHeight])

    const resizeHandler = () => {
        setBarIsVisible(window.innerHeight >= window.screen.availHeight * 0.8)
    };

    useEffect(() => {
        window.addEventListener("resize", resizeHandler);
        resizeHandler();
        return () => {
            window.removeEventListener("resize", resizeHandler);
        };
    }, [])

    return (<div className={style['mainDivision']}>
        <div
            style={{zIndex: 100, paddingBottom: String(tg?.contentSafeAreaInset.bottom + tg?.safeAreaInset.bottom + 0.1 * window.innerWidth) + 'px'}}
            onScroll={(event) => {
                lastScroll = (event.target.scrollTop);
            }}
            ref={scrollRef}>
            <div>
                <CatalogListHead/>
                <CatalogListBody/>
            </div>
        </div>
        <div style={{
            zIndex: zIndexTab,
            background: zIndexTab > 0 && opacityTab !== 0 ? '#222222' : 'none'
        }}>
            <div style={{opacity: opacityTab}}>
                <Routes>
                    <Route path="/search" element={<Search/>}/>
                    <Route path="/basket" element={<Basket/>}/>
                    <Route path="/selectPlatform" element={<SelectPlatform/>}/>
                    <Route path="/more" element={<MoreInfo/>}/>
                </Routes>
            </div>
        </div>
        <div style={{opacity: barIsVisible ? 1 : 0}}>
            <NavigationBar setZIndexTab={setZIndexTab} zIndexTab={zIndexTab} opacityTab={opacityTab}
                           setOpacityTab={setOpacityTab}/>
        </div>

        {/*<div style={{height: String(tg.contentSafeAreaInset.bottom + tg.safeAreaInset.bottom) + 'px', overflow:'hidden', background:'#222222', zIndex:'-100'}}><div style={{height: '100vh'}}/></div>*/}
    </div>);
};

export default MainPage;