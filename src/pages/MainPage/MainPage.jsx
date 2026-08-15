import React, {useEffect, useRef, useState} from 'react';
import '../../app/styles/style.css';
import {useTelegram} from "../../hooks/useTelegram";
import useGlobalData from "../../hooks/useGlobalData";
import style from './MainPage.module.scss'
import NavigationBar from "../NavigationBar/NavigationBar";
import DesktopHeader from "../NavigationBar/DesktopHeader";
import {Route, Routes, useNavigate} from "react-router-dom";
import Search from "../Search/Search";
import Basket from "../Basket/Basket";
import MoreInfo from "../MoreInfo/MoreInfo";
import SelectPlatform from "../SelectPlatform/SelectPlatform";
import Catalogs from '../MainScreen/Catalogs';
import {useAppInsets} from "../../hooks/useAppInsets";

let lastScroll = 0

const MainPage = () => {
    const { tg} = useTelegram();
    const { safeAreaInset, contentSafeAreaInset, isKeyboardOpen } = useAppInsets();
    const [opacityTab, setOpacityTab] = useState(0);
    const [zIndexTab, setZIndexTab] = useState(-10);
    const [barIsVisibleLocal, setBarIsVisibleLocal] = useState(true);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
    const scrollRef = useRef(null);
    const {pageId, barIsVisible} = useGlobalData()
    const navigate = useNavigate();


    useEffect(() => {
        tg.BackButton.hide();
        if (pageId === -1) {
            navigate('/main/selectPlatform', { replace: true })
        }
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: lastScroll, behavior: "instant",
            });
        }
    }, [])

    useEffect(()=>{
        setBarIsVisibleLocal(!isKeyboardOpen)
    }, [isKeyboardOpen])

    const resizeHandler = () => {
        setIsDesktop(window.innerWidth >= 768)
    };

    useEffect(() => {
        window.addEventListener("resize", resizeHandler);
        resizeHandler();
        return () => {
            window.removeEventListener("resize", resizeHandler);
        };
    }, [])


    return (
        <div className={style.mainDivision} style={{
            paddingBottom: String(safeAreaInset.bottom + contentSafeAreaInset.bottom) + 'px',
            gridTemplateRows: barIsVisibleLocal && barIsVisible && !isDesktop ? '1fr 14vw' : '1fr 0'
        }}>
            <div style={{opacity: opacityTab}} className={style.bodyContainer}>
                <Routes>
                    <Route path="catalogs" element={<Catalogs/>}/>
                    <Route path="search" element={<Search/>}/>
                    <Route path="basket" element={<Basket/>}/>
                    <Route path="selectPlatform" element={<SelectPlatform/>}/>
                    <Route path="more" element={<MoreInfo/>}/>
                </Routes>
            </div>

            {pageId !== -1 && (
                <div className={style.barSlot} style={{bottom: String(safeAreaInset.bottom + contentSafeAreaInset.bottom) + 'px'}}>
                    {isDesktop ? (
                        <DesktopHeader setZIndexTab={setZIndexTab} setOpacityTab={setOpacityTab}/>
                    ) : (
                        <div style={{
                            opacity: barIsVisibleLocal && barIsVisible ? 1 : 0,
                            // без этого скрытый (opacity: 0) бар продолжает ловить тапы
                            // и перехватывает нажатия по контенту над клавиатурой
                            pointerEvents: barIsVisibleLocal && barIsVisible ? 'auto' : 'none',
                            transition: 'opacity 0.2s ease-in-out'
                        }}>
                            <NavigationBar setZIndexTab={setZIndexTab} zIndexTab={zIndexTab} opacityTab={opacityTab}
                                           setOpacityTab={setOpacityTab}/>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MainPage;
