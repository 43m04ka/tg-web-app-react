import React, {useEffect, useRef, useState} from 'react';
import '../../app/styles/style.css';
import {useTelegram} from "../../hooks/useTelegram";
import useGlobalData from "../../hooks/useGlobalData";
import style from './MainPage.module.scss'
import NavigationBar from "../NavigationBar/NavigationBar";
import DesktopHeader from "../NavigationBar/DesktopHeader";
import CatalogListBody from "../MainScreen/CatalogListBody";
import CatalogListHead from "../MainScreen/CatalogListHead";
import {Route, Routes, useNavigate} from "react-router-dom";
import Search from "../Search/Search";
import Basket from "../Basket/Basket";
import MoreInfo from "../MoreInfo/MoreInfo";
import SelectPlatform from "../SelectPlatform/SelectPlatform";

let lastScroll = 0

const MainPage = ({page}) => {
    const { tg, safeAreaInset, contentSafeAreaInset } = useTelegram();
    const [opacityTab, setOpacityTab] = useState(0);
    const [zIndexTab, setZIndexTab] = useState(-10);
    const [barIsVisibleLocal, setBarIsVisibleLocal] = useState(true);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
    const scrollRef = useRef(null);
    const {pageId, setPageId, barIsVisible} = useGlobalData()


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
        setBarIsVisibleLocal(window.screen.availHeight < window.screen.availWidth || window.innerHeight >= window.screen.availHeight * 0.8)
        setTimeout(()=>{
            setBarIsVisibleLocal(window.screen.availHeight < window.screen.availWidth ||window.innerHeight >= window.screen.availHeight * 0.8)
        }, 300)
    }, [window.innerHeight , window.screen.availHeight, window.screen.availHeight])

    const resizeHandler = () => {
        setIsDesktop(window.innerWidth >= 768)
        setBarIsVisibleLocal(window.screen.availHeight < window.screen.availWidth ||window.innerHeight >= window.screen.availHeight * 0.8)
        setTimeout(()=>{
            setBarIsVisibleLocal(window.screen.availHeight < window.screen.availWidth || window.innerHeight >= window.screen.availHeight * 0.8)
        }, 300)
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
            style={{zIndex: 100, paddingBottom: String(contentSafeAreaInset.bottom + safeAreaInset.bottom + 0.1 * window.innerWidth) + 'px'}}
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
        <div className={style['barSlot']}>
            {isDesktop ? (
                <DesktopHeader setZIndexTab={setZIndexTab} setOpacityTab={setOpacityTab}/>
            ) : (
                <div style={{opacity: barIsVisibleLocal && barIsVisible ? 1 : 0}}>
                    <NavigationBar setZIndexTab={setZIndexTab} zIndexTab={zIndexTab} opacityTab={opacityTab}
                                   setOpacityTab={setOpacityTab}/>
                </div>
            )}
        </div>

        {/*<div style={{height: String(contentSafeAreaInset.bottom + safeAreaInset.bottom) + 'px', overflow:'hidden', background:'#222222', zIndex:'-100'}}><div style={{height: '100vh'}}/></div>*/}
    </div>);
};

export default MainPage;
